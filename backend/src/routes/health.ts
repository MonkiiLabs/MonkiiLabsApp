import { Router, Request, Response } from "express";

export const healthRouter = Router();

healthRouter.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    service: "monkii-labs-backend",
    network: "robinhood-chain-l2",
  });
});

healthRouter.get(["/network", "/api/network"], (_req: Request, res: Response) => {
  res.json({
    chain: "Robinhood Chain",
    chainId: 4663,
    type: "Arbitrum Orbit L2",
    gasToken: "ETH",
    tokens: {
      earning: "$MONKI",
      stakingReward: "$PONS",
      ponsTokenAddress: "0x39dbed3a2bd333467115de45665cc57f813c4571",
      metaStockToken: "Phase 2 (50:50 Staking Split)",
    },
  });
});
