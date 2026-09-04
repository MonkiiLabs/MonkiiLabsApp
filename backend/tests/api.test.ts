import { describe, expect, test } from "bun:test";
import request from "supertest";
import { app } from "../src/app";

const hasLiveDb = Boolean(
  process.env.DATABASE_URL &&
    process.env.DATABASE_URL.startsWith("postgres") &&
    !process.env.DATABASE_URL.includes("localhost") &&
    !process.env.DATABASE_URL.includes("127.0.0.1"),
);

describe("Public API Endpoints", () => {
  test("GET /health returns 200 and health status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.network).toBe("robinhood-chain-l2");
  });

  test("GET /api/network returns Robinhood Chain L2 configuration", async () => {
    const res = await request(app).get("/api/network");
    expect(res.status).toBe(200);
    expect(res.body.chainId).toBe(4663);
    expect(res.body.chain).toBe("Robinhood Chain");
    expect(res.body.tokens.earning).toBe("$MONKI");
    expect(res.body.tokens.stakingReward).toBe("$PONS");
  });

  test("POST /api/auth/nonce rejects invalid addresses", async () => {
    const res = await request(app)
      .post("/api/auth/nonce")
      .send({ walletAddress: "not-an-evm-address" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_address");
  });

  // Database-dependent integration tests run when DATABASE_URL is configured
  test.skipIf(!hasLiveDb)("POST /api/auth/nonce generates valid signing challenge", async () => {
    const res = await request(app)
      .post("/api/auth/nonce")
      .send({ walletAddress: "0x566332F349Adbb909eFB0382316A63C255F3D7F5" });

    expect(res.status).toBe(200);
    expect(res.body.nonce).toBeDefined();
    expect(typeof res.body.nonce).toBe("string");
    expect(res.body.message).toContain("Monkii Labs wants you to sign in with your Robinhood Chain wallet.");
  }, 15000);

  test.skipIf(!hasLiveDb)("GET /api/agents returns fleet catalog", async () => {
    const res = await request(app).get("/api/agents");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.agents)).toBe(true);
  });

  test.skipIf(!hasLiveDb)("GET /api/companions/catalog returns active companion archetypes", async () => {
    const res = await request(app).get("/api/companions/catalog");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.companions)).toBe(true);
  });

  test.skipIf(!hasLiveDb)("GET /api/leaderboard/top-agents returns leaderboard rankings", async () => {
    const res = await request(app).get("/api/leaderboard/top-agents");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.agents)).toBe(true);
  });
});
