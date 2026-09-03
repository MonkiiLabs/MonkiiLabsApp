import { describe, expect, test } from "bun:test";
import request from "supertest";
import { app } from "../src/app";

describe("Health Check API", () => {
  test("GET /health returns 200 and valid status payload", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.timestamp).toBe("string");

    // Verify valid ISO timestamp
    const date = new Date(res.body.timestamp);
    expect(Number.isNaN(date.getTime())).toBe(false);
  });
});
