import { beforeAll, describe, expect, test } from "bun:test";
import request from "supertest";
import { app } from "../src/app";
import { createSession } from "../src/lib/auth";
import { electionInForceAt } from "../src/routes/rwa";

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
    const token = await createSession({
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
    const token = await createSession({
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
    const token = await createSession({
      id: "f35688b1-3642-4f36-8bb0-d790d1bf4301",
      walletAddress: "0x566332F349Adbb909eFB0382316A63C255F3D7F5",
    });

    const res = await request(app)
      .post("/api/rwa/election")
      .set("Authorization", `Bearer ${token}`)
      .send({
        mode: "stock_elected",
        allocations: [{ symbol: "FAKETOKEN", percentage: 100 }],
        acceptedDisclaimer: true,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("token_not_eligible");
  });

  test("POST /api/rwa/election rejects duplicate tokens in basket", async () => {
    const token = await createSession({
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

  test("GET /api/rwa/election/history requires authentication", async () => {
    const res = await request(app).get("/api/rwa/election/history");
    expect(res.status).toBe(401);
  });

  test("GET /api/rwa/balances requires authentication", async () => {
    const res = await request(app).get("/api/rwa/balances");
    expect(res.status).toBe(401);
  });

  test("GET /api/rwa/balances returns real-time balances for $MONKI, $PONS and RWAs", async () => {
    const token = await createSession({
      id: "f35688b1-3642-4f36-8bb0-d790d1bf4301",
      walletAddress: "0x566332F349Adbb909eFB0382316A63C255F3D7F5",
    });

    const res = await request(app)
      .get("/api/rwa/balances")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.network).toBe("robinhood-chain-l2");
    expect(res.body.chainId).toBe(4663);
    expect(res.body.monki).toBeDefined();
    expect(typeof res.body.monki.claimable).toBe("number");
    expect(typeof res.body.monki.total).toBe("number");
    expect(res.body.pons).toBeDefined();
    expect(typeof res.body.pons.claimable).toBe("number");
    expect(Array.isArray(res.body.rwaTokens)).toBe(true);
    expect(res.body.rwaTokens.length).toBeGreaterThan(0);

    const nvda = res.body.rwaTokens.find((t: any) => t.symbol === "NVDA");
    expect(nvda).toBeDefined();
    expect(nvda.contractAddress).toBeDefined();
  });
});


/* =====================================================================
   Election history.

   These need a real database. The rest of this file passes without one
   because the read routes fall back, but history deliberately does not
   fall back, and an append-only table cannot be asserted against in
   memory. With no DATABASE_URL the block is skipped rather than failed,
   so `bun test` stays useful on a machine with no Postgres.

   The table refuses deletes by design, so there is no teardown. Each run
   works on a fresh wallet instead, which is the only cleanup an
   append-only record allows.
   ===================================================================== */

const describeWithDb = process.env.DATABASE_URL ? describe : describe.skip;

function freshWallet(): string {
  const hex = Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]);
  return `0x${hex.join("")}`;
}

describeWithDb("RWA election history", () => {
  const walletAddress = freshWallet();
  let token = "";

  beforeAll(async () => {
    token = await createSession({ id: crypto.randomUUID(), walletAddress });
  });

  async function save(
    mode: "stock_elected" | "plain_pons",
    allocations: Array<{ symbol: string; percentage: number }>,
  ) {
    return request(app)
      .post("/api/rwa/election")
      .set("Authorization", `Bearer ${token}`)
      .send({ mode, allocations, acceptedDisclaimer: true });
  }

  function history(query = "") {
    return request(app)
      .get(`/api/rwa/election/history${query}`)
      .set("Authorization", `Bearer ${token}`);
  }

  const basket = [
    { symbol: "NVDA", percentage: 60 },
    { symbol: "AAPL", percentage: 40 },
  ];

  test("a first election opens a period that is in force", async () => {
    const res = await save("stock_elected", basket);

    expect(res.status).toBe(200);
    expect(res.body.changed).toBe(true);
    expect(res.body.period).toBeDefined();
    expect(res.body.period.isCurrent).toBe(true);
    expect(res.body.period.effectiveTo).toBeNull();
    expect(res.body.period.allocations.map((a: any) => a.symbol)).toEqual(["NVDA", "AAPL"]);
  });

  test("saving the same basket again opens no new period", async () => {
    const first = await history();
    const openBefore = first.body.current.id;

    const res = await save("stock_elected", basket);

    expect(res.status).toBe(200);
    expect(res.body.changed).toBe(false);
    expect(res.body.period.id).toBe(openBefore);

    const after = await history();
    expect(after.body.periods.length).toBe(first.body.periods.length);
  });

  test("reordering the same basket is not a change", async () => {
    const res = await save("stock_elected", [
      { symbol: "AAPL", percentage: 40 },
      { symbol: "NVDA", percentage: 60 },
    ]);

    expect(res.status).toBe(200);
    expect(res.body.changed).toBe(false);
  });

  test("shifting a weight closes the old period and opens a new one, with no gap", async () => {
    const before = await history();
    const previousId = before.body.current.id;

    const res = await save("stock_elected", [
      { symbol: "NVDA", percentage: 70 },
      { symbol: "AAPL", percentage: 30 },
    ]);
    expect(res.body.changed).toBe(true);
    expect(res.body.period.id).not.toBe(previousId);

    const after = await history();
    const [current, previous] = after.body.periods;

    expect(current.isCurrent).toBe(true);
    expect(previous.id).toBe(previousId);
    // The period that closed and the period that opened share one instant,
    // so no accrual can land in a window that belongs to no basket.
    expect(previous.effectiveTo).toBe(current.effectiveFrom);
  });

  test("switching to plain PONS is recorded as its own period", async () => {
    const res = await save("plain_pons", []);

    expect(res.status).toBe(200);
    expect(res.body.changed).toBe(true);
    expect(res.body.period.mode).toBe("plain_pons");
    expect(res.body.period.allocations).toEqual([]);
  });

  test("history reads newest first with exactly one period in force", async () => {
    const res = await history();

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.periods.length).toBe(3);
    expect(res.body.current.isCurrent).toBe(true);
    expect(res.body.periods.filter((p: any) => p.isCurrent).length).toBe(1);

    const starts = res.body.periods.map((p: any) => Date.parse(p.effectiveFrom));
    expect([...starts].sort((a: number, b: number) => b - a)).toEqual(starts);
  });

  test("an unreadable limit is refused rather than silently clamped", async () => {
    const res = await history("?limit=0");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("invalid_query");
  });

  test("the basket in force at a past instant is the one that was live then", async () => {
    const res = await history();
    const periods = res.body.periods;
    const first = periods[periods.length - 1];

    // A boundary handed out by the API has to find its own period on the way
    // back in, which is why the stored bounds are truncated to milliseconds.
    const atFirst = await electionInForceAt(walletAddress, new Date(first.effectiveFrom));
    expect(atFirst?.id).toBe(first.id);
    expect(atFirst?.allocations.map((a) => a.symbol)).toEqual(["NVDA", "AAPL"]);

    const now = await electionInForceAt(walletAddress, new Date());
    expect(now?.mode).toBe("plain_pons");

    const beforeAnything = await electionInForceAt(
      walletAddress,
      new Date(Date.parse(first.effectiveFrom) - 60_000),
    );
    expect(beforeAnything).toBeNull();
  });
});
