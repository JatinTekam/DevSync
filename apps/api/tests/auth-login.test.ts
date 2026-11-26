import { randomUUID } from "node:crypto";
import { jwtVerify } from "jose";
import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

const testEmails: string[] = [];
const testOrganizationNames: string[] = [];

async function createRegisteredUser() {
  const id = randomUUID();
  const email = `login-${id}@example.com`;
  const password = "A-strong-test-password-2026";
  const organizationName = `Login Test Organization ${id}`;

  testEmails.push(email);
  testOrganizationNames.push(organizationName);

  const response = await request(createApp())
    .post("/api/v1/auth/register")
    .send({ email, password, organizationName });

  expect(response.status).toBe(201);
  return { email, password };
}

afterEach(async () => {
  if (testOrganizationNames.length > 0) {
    await prisma.organization.deleteMany({
      where: { name: { in: testOrganizationNames } },
    });
  }

  if (testEmails.length > 0) {
    await prisma.user.deleteMany({
      where: { email: { in: testEmails } },
    });
  }

  testOrganizationNames.length = 0;
  testEmails.length = 0;
});

describe("POST /api/v1/auth/login", () => {
  it("returns an access token and sets an HttpOnly refresh cookie", async () => {
    const account = await createRegisteredUser();

    const response = await request(createApp())
      .post("/api/v1/auth/login")
      .send({ email: account.email, password: account.password });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(account.email);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body).not.toHaveProperty("refreshToken");

    const setCookieHeader = response.headers["set-cookie"];
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : setCookieHeader
        ? [setCookieHeader]
        : [];
    const cookie = cookies.find((value: string) =>
      value.startsWith("devsync_refresh="),
    );
    expect(cookie?.toLowerCase()).toContain("httponly");

    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error("JWT_ACCESS_SECRET is missing in test setup");

    const { payload } = await jwtVerify(
      response.body.accessToken,
      new TextEncoder().encode(secret),
      { issuer: "devsync-api", audience: "devsync-web" },
    );

    expect(payload.sub).toBe(response.body.user.id);
  });

  it("returns the same unauthorized error for an incorrect password", async () => {
    const account = await createRegisteredUser();

    const response = await request(createApp())
      .post("/api/v1/auth/login")
      .send({ email: account.email, password: "Wrong-password-2026" });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns the same unauthorized error for an unknown email", async () => {
    const response = await request(createApp())
      .post("/api/v1/auth/login")
      .send({
        email: `missing-${randomUUID()}@example.com`,
        password: "Any-password-2026",
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("revokes the refresh-token family on logout", async () => {
  const account = await createRegisteredUser();

  const loginResponse = await request(createApp())
    .post("/api/v1/auth/login")
    .send({ email: account.email, password: account.password });

  expect(loginResponse.status).toBe(200);

  const setCookieHeader = loginResponse.headers["set-cookie"];
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : setCookieHeader
      ? [setCookieHeader]
      : [];

  const refreshCookie = cookies.find((value: string) =>
    value.startsWith("devsync_refresh="),
  );

  if (!refreshCookie) {
    throw new Error("Login did not set the refresh-token cookie");
  }

  const cookiePair = refreshCookie.split(";")[0];
  if (!cookiePair) {
    throw new Error("Refresh-token cookie was empty");
  }

  const logoutResponse = await request(createApp())
    .post("/api/v1/auth/logout")
    .set("Cookie", cookiePair);

  expect(logoutResponse.status).toBe(204);

  const refreshResponse = await request(createApp())
    .post("/api/v1/auth/refresh")
    .set("Cookie", cookiePair);

  expect(refreshResponse.status).toBe(401);
  expect(refreshResponse.body.error.code).toBe("INVALID_REFRESH_TOKEN");
});
});