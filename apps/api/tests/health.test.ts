import { describe, expect, it } from "vitest"
import request from "supertest"
import { createApp } from "../src/app.js"

describe("GET /api/v1/health", () => {
  it("returns a healthy response", async () => {
    const response = await request(createApp()).get("/api/v1/health")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      status: "ok",
      service: "devsync-api",
    })
  })
})