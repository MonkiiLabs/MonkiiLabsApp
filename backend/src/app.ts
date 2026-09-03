import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";

import { env } from "./lib/env";
import { requestLogger, isAllowedOrigin } from "./lib/http";
import { sessionMiddleware } from "./lib/auth";

import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { agentsRouter } from "./routes/agents";
import { sessionsRouter } from "./routes/sessions";
import { rewardsRouter } from "./routes/rewards";
import { stakingRouter } from "./routes/staking";
import { companionsRouter } from "./routes/companions";
import { dashboardRouter } from "./routes/dashboard";
import { leaderboardRouter } from "./routes/leaderboard";
import { telegramRouter } from "./routes/telegram";
import { adminRouter } from "./routes/admin";

export function createApp() {
  const app = express();

  app.use(requestLogger);
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || env.corsOrigins.includes("*") || isAllowedOrigin(origin, env.corsOrigins)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
    }),
  );
  app.use(express.json({ limit: "256kb" }));
  app.use(sessionMiddleware);

  // Root entry & health
  app.get("/", (_req, res) => {
    res.json({
      name: "Monkii Labs API",
      status: "ok",
      health: "/health",
      network: "Robinhood Chain L2 (4663)",
      tokens: {
        earning: "$MONKI",
        staking_yield: "$PONS",
        equity_yield: "$META Stock Token",
      },
    });
  });

  app.use(healthRouter);

  // API Routes
  const routers = [
    healthRouter,
    authRouter,
    agentsRouter,
    sessionsRouter,
    rewardsRouter,
    stakingRouter,
    companionsRouter,
    dashboardRouter,
    leaderboardRouter,
    telegramRouter,
    adminRouter,
  ];
  for (const r of routers) {
    app.use("/api", r);
  }

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
  });

  // Central error handler
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[error]", err);
    res.status(500).json({ error: "internal_error" });
  });

  return app;
}

export const app = createApp();
