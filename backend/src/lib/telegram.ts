import { env } from "./env";
import { pool } from "../db/index";

export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  if (!env.telegramBotToken) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function handleTelegramUpdate(update: any): Promise<void> {
  const msg = update.message;
  if (!msg?.text) return;
  const chatId = String(msg.chat.id);
  const text = msg.text.trim();

  // Handle /start <code> command for account linking
  if (text.startsWith("/start")) {
    const parts = text.split(" ");
    const code = parts[1]?.trim();
    if (code) {
      const res = await pool.query(
        `UPDATE users
            SET telegram_chat_id = $1, telegram_username = $2, telegram_link_code = NULL
          WHERE telegram_link_code = $3`,
        [chatId, msg.from?.username ?? null, code],
      );
      if ((res.rowCount ?? 0) > 0) {
        await sendTelegramMessage(
          chatId,
          "🐒 <b>Welcome to Monkii Labs!</b>\nYour Telegram is now linked to your Monkii Labs account. You will receive real-time alerts whenever your nurtured agents lose vitality.",
        );
        return;
      }
    }
    await sendTelegramMessage(
      chatId,
      "🐒 <b>Monkii Labs Sentinel Bot</b>\nTo link your account, navigate to the Monkii Labs cockpit, copy your pairing code, and send <code>/start &lt;code&gt;</code> here.",
    );
  }
}

let pollingActive = false;
export function startTelegramPolling(): void {
  if (!env.telegramBotToken || env.telegramWebhookUrl || pollingActive) return;
  pollingActive = true;
  let offset = 0;

  async function poll() {
    while (pollingActive) {
      try {
        const res = await fetch(
          `https://api.telegram.org/bot${env.telegramBotToken}/getUpdates?offset=${offset}&timeout=30`,
        );
        if (res.ok) {
          const data: any = await res.json();
          if (data.result && Array.isArray(data.result)) {
            for (const update of data.result) {
              offset = update.update_id + 1;
              await handleTelegramUpdate(update);
            }
          }
        }
      } catch {
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  poll().catch(() => {});
  console.log("[telegram] Long-polling started");
}

export async function registerTelegramWebhook(webhookUrl: string): Promise<boolean> {
  if (!env.telegramBotToken) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const data: any = await res.json();
    if (data.ok) {
      console.log(`[telegram] Webhook successfully registered for ${webhookUrl}`);
      return true;
    } else {
      console.error(`[telegram] Failed to register webhook:`, data);
      return false;
    }
  } catch (err) {
    console.error(`[telegram] Error registering webhook:`, err);
    return false;
  }
}
