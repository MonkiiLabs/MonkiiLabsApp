import "dotenv/config";
import { app } from "./app";
import { migrate } from "./db/migrate";

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    console.log("[Monkii Labs] Running database migrations...");
    await migrate();
  } catch (err) {
    console.error("[Monkii Labs] Migration error:", err);
  }

  app.listen(PORT, () => {
    console.log(`[Monkii Labs API] Server running on port ${PORT}`);
    console.log(`[Monkii Labs API] Network: Robinhood Chain (Arbitrum Orbit L2)`);
  });
}

start();
