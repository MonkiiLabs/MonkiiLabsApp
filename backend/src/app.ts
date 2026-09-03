import express, { Express } from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Mount routes
  app.use("/health", healthRouter);

  // Root basic info
  app.get("/", (_req, res) => {
    res.json({
      name: "Monkii Labs Backend API",
      network: "Robinhood Chain L2",
      tokens: {
        earning: "$MONKI",
        staking_yield: "$PONS",
        equity_yield: "$META Stock Token",
      },
    });
  });

  return app;
}

export const app = createApp();
