import { Router } from "express";
import { randomBytes } from "node:crypto";

import { pool } from "../db/index";
import { requireAuth } from "../lib/auth";
import { handler } from "../lib/http";
import { env } from "../lib/env";
import { handleTelegramUpdate } from "../lib/telegram";

export const telegramRouter = Router();

// POST /api/telegram/webhook — incoming updates from Telegram webhook
telegramRouter.post(
  "/telegram/webhook",
  handler(async (req, res) => {
    await handleTelegramUpdate(req.body);
    res.json({ ok: true });
  }),
);

// GET /api/telegram/status — bot status & username
telegramRouter.get(
  "/telegram/status",
  handler(async (_req, res) => {
    res.json({
      configured: Boolean(env.telegramBotToken),
      botUsername: env.telegramBotUsername,
      webhookMode: Boolean(env.telegramWebhookUrl),
    });
  }),
);

// POST /api/telegram/link-code — generate pairing code for Telegram bot
telegramRouter.post(
  "/telegram/link-code",
  requireAuth,
  handler(async (req, res) => {
    const code = randomBytes(3).toString("hex").toUpperCase();
    await pool.query(
      `UPDATE users SET telegram_link_code = $1 WHERE wallet_address = $2`,
      [code, req.user!.walletAddress],
    );
    res.json({
      linkCode: code,
      botUsername: env.telegramBotUsername,
      instructions: `Open Telegram, search for @${env.telegramBotUsername || "MonkiiLabsBot"}, and send: /start ${code}`,
    });
  }),
);
