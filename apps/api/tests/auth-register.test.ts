import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

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
});