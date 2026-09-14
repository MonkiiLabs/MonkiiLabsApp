import { describe, expect, test } from "bun:test";
import request from "supertest";
import { app } from "../src/app";
import { issueSessionToken } from "../src/lib/auth";

describe("RWA Stock-Elected Payouts (Sprint F)", () => {
  test("GET /api/rwa/tokens returns eligible stock token registry", async () => {
    const res = await request(app).get("/api/rwa/tokens");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.chainId).toBe(4663);
    expect(res.body.network).toBe("robinhood-chain-l2");
    expect(res.body.stage).toBe("sprint_f_accrual_only");
    expect(Array.isArray(res.body.tokens)).toBe(true);
    expect(res.body.tokens.length).toBeGreaterThan(0);

    const nvda = res.body.tokens.find((t: any) => t.symbol === "NVDA");
    expect(nvda).toBeDefined();
    expect(nvda.name).toContain("NVIDIA");
    expect(nvda.isLiquid).toBe(true);
    expect(nvda.isSuspended).toBe(false);

    // Compliance check: non-US person boundary & no APY promise
    expect(res.body.disclaimer).toContain("not for US persons");
    expect(res.body.disclaimer).toContain("no APY");
  });

  test("GET /api/rwa/election requires authentication", async () => {
    const res = await request(app).get("/api/rwa/election");
    expect(res.status).toBe(401);
  });

  test("POST /api/rwa/election requires authentication", async () => {
    const res = await request(app)
      .post("/api/rwa/election")
      .send({
        mode: "stock_elected",
        allocations: [{ symbol: "NVDA", percentage: 100 }],
        acceptedDisclaimer: true,
      });
    expect(res.status).toBe(401);
  });

  test("POST /api/rwa/election rejects if disclaimer is not accepted", async () => {
    const token = await issueSessionToken({
      id: "f35688b1-3642-4f36-8bb0-d790d1bf4301",
      walletAddress: "0x566332F349Adbb909eFB0382316A63C255F3D7F5",
    });

    const res = await request(app)
      .post("/api/rwa/election")
      .set("Authorization", `Bearer ${token}`)
      .send({
        mode: "stock_elected",
        allocations: [{ symbol: "NVDA", percentage: 100 }],
        acceptedDisclaimer: false,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("disclaimer_not_accepted");
  });

  test("POST /api/rwa/election rejects allocations that do not sum to 100%", async () => {
    const token = await issueSessionToken({
      id: "f35688b1-3642-4f36-8bb0-d790d1bf4301",
      walletAddress: "0x566332F349Adbb909eFB0382316A63C255F3D7F5",
    });

    const res = await request(app)
      .post("/api/rwa/election")
      .set("Authorization", `Bearer ${token}`)
      .send({
        mode: "stock_elected",
        allocations: [
          { symbol: "NVDA", percentage: 60 },
          { symbol: "SPY", percentage: 30 }, // sums to 90%
        ],
        acceptedDisclaimer: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_allocation_sum");
  });

  test("POST /api/rwa/election rejects unknown stock tokens", async () => {
    const token = await issueSessionToken({
      id: "f35688b1-3642-4f36-8bb0-d790d1bf4301",
      walletAddress: "0x566332F349Adbb909eFB0382316A63C255F3D7F5",
    });

    const res = await request(app)
      .post("/api/rwa/election")
      .set("Authorization", `Bearer ${token}`)
      .send({
        mode: "stock_elected",
        allocations: [{ symbol: "FAKE_TICKER", percentage: 100 }],
        acceptedDisclaimer: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("token_not_eligible");
  });

  test("POST /api/rwa/election rejects duplicate tokens in basket", async () => {
    const token = await issueSessionToken({
      id: "f35688b1-3642-4f36-8bb0-d790d1bf4301",
      walletAddress: "0x566332F349Adbb909eFB0382316A63C255F3D7F5",
    });

    const res = await request(app)
      .post("/api/rwa/election")
      .set("Authorization", `Bearer ${token}`)
      .send({
        mode: "stock_elected",
        allocations: [
          { symbol: "NVDA", percentage: 50 },
          { symbol: "NVDA", percentage: 50 },
        ],
        acceptedDisclaimer: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("duplicate_tokens");
  });
});
