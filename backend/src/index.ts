import "dotenv/config";
import { app } from "./app";
import { env } from "./lib/env";
import { migrate } from "./db/migrate";
import { startPowerEval } from "./services/power-eval";
import { registerTelegramWebhook, startTelegramPolling } from "./lib/telegram";

async function main() {
  if (env.databaseUrl) {
    try {
      console.log("[startup] Running database migrations...");
      await migrate();
    } catch (err) {
      console.error("[startup] Migration error:", err);
    }
  } else {
    console.warn("[startup] DATABASE_URL not set — skipping migrations.");
  }

  app.listen(env.port, () => {
    console.log(`[startup] Monkii Labs API listening on :${env.port} (${env.nodeEnv}) — Robinhood Chain L2`);
  });

  if (env.databaseUrl) {
    // Start periodic power decay & vitality evaluator
    startPowerEval();

    // Start Telegram webhook or polling
    if (env.telegramWebhookUrl && env.telegramBotToken) {
      console.log(`[telegram] Registering webhook for ${env.telegramWebhookUrl}...`);
      await registerTelegramWebhook(env.telegramWebhookUrl);
    } else if (env.telegramBotToken) {
      startTelegramPolling();
    }
  }
}

main().catch((err) => {
  console.error("[startup] Fatal error:", err);
  process.exit(1);
});
