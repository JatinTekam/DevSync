import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

const testEmails: string[] = [];
const testOrganizationNames: string[] = [];

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

describe("POST /api/v1/auth/register", () => {
  it("rejects invalid input", async () => {
    const response = await request(createApp())
      .post("/api/v1/auth/register")
      .send({
        email: "not-an-email",
        password: "short",
        organizationName: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("creates a user, organization, and owner membership", async () => {
    const id = randomUUID();
    const email = `register-${id}@example.com`;
    const organizationName = `Test Organization ${id}`;

    testEmails.push(email);
    testOrganizationNames.push(organizationName);

    const response = await request(createApp())
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "A-strong-test-password-2026",
        organizationName,
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(email);
    expect(response.body.user).not.toHaveProperty("passwordHash");
    expect(response.body.organization.name).toBe(organizationName);
    expect(response.body.membership.role).toBe("OWNER");
  });

  it("rejects an email that is already registered", async () => {
    const id = randomUUID();
    const email = `duplicate-${id}@example.com`;
    const organizationName = `Test Organization ${id}`;

    testEmails.push(email);
    testOrganizationNames.push(organizationName, `Second Organization ${id}`);

    const firstResponse = await request(createApp())
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "A-strong-test-password-2026",
        organizationName,
      });

    expect(firstResponse.status).toBe(201);

    const duplicateResponse = await request(createApp())
      .post("/api/v1/auth/register")
      .send({
        email,
        password: "A-different-test-password-2026",
        organizationName: `Second Organization ${id}`,
      });

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.error.code).toBe("EMAIL_ALREADY_REGISTERED");
  });
});
