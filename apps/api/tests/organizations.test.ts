import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

const testEmails: string[] = [];
const testOrganizationNames: string[] = [];

async function createRegisteredUser() {
  const id = randomUUID();
  const email = `organization-${id}@example.com`;
  const password = "A-strong-test-password-2026";
  const organizationName = `Test Organization ${id}`;

  testEmails.push(email);
  testOrganizationNames.push(organizationName);

  const registration = await request(createApp())
    .post("/api/v1/auth/register")
    .send({ email, password, organizationName });

  expect(registration.status).toBe(201);

  const login = await request(createApp())
    .post("/api/v1/auth/login")
    .send({ email, password });

  expect(login.status).toBe(200);

  return {
    accessToken: login.body.accessToken as string,
    organizationName,
  };
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

describe("GET /api/v1/organizations", () => {
  it("returns only organizations belonging to the authenticated user", async () => {
    const firstUser = await createRegisteredUser();
    const secondUser = await createRegisteredUser();

    const response = await request(createApp())
      .get("/api/v1/organizations")
      .set("Authorization", `Bearer ${firstUser.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.organizations).toHaveLength(1);
    expect(response.body.organizations[0].organization.name).toBe(
      firstUser.organizationName,
    );
    expect(response.body.organizations[0].organization.name).not.toBe(
      secondUser.organizationName,
    );
  });

  it("rejects requests without an access token", async () => {
    const response = await request(createApp()).get(
      "/api/v1/organizations",
    );

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });
});