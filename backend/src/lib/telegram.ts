import { env } from "./env";
import { pool } from "../db/index";
import { liveStateOf } from "./power";

export interface UserTelegramStats {
  walletAddress: string;
  telegramUsername: string | null;
  totalMonkiMined: number;
  claimableMonki: number;
  claimedMonki: number;
  stakedMonki: number;
  rewardMultiplier: number;
  claimablePons: number;
  claimedPons: number;
  totalPonsEarned: number;
  powerRank: number;
  totalHeartbeats: number;
  activeAgents: Array<{
    id: string;
    name: string;
    power: number;
    state: string;
    powerContributed: number;
    monkiEarned: number;
  }>;
}

export const MAIN_KEYBOARD = {
  keyboard: [
    [{ text: "📊 My Stats" }, { text: "🍌 Mined $MONKI" }],
    [{ text: "💎 $PONS Yield" }, { text: "🤖 Nurtured Fleet" }],
    [{ text: "🌐 Open Cockpit" }, { text: "❓ Help" }],
  ],
  resize_keyboard: true,
  persistent: true,
};

export function getStatsInlineKeyboard(appUrl = env.appUrl) {
  return {
    inline_keyboard: [
      [
        { text: "🔄 Refresh", callback_data: "refresh_stats" },
        { text: "🌐 Open Cockpit", url: `${appUrl}/dashboard` },
      ],
    ],
  };
}

export function truncateAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function fmtNum(n: number, decimals = 2): string {
  return Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtInt(n: number): string {
  return Number(n || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

export async function sendTelegramMessage(
  chatId: string,
  text: string,
  options?: {
    reply_markup?: any;
    parse_mode?: string;
    disable_web_page_preview?: boolean;
  },
): Promise<boolean> {
  if (!env.telegramBotToken) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parse_mode ?? "HTML",
        disable_web_page_preview: options?.disable_web_page_preview ?? false,
        reply_markup: options?.reply_markup,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
): Promise<boolean> {
  if (!env.telegramBotToken) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${env.telegramBotToken}/answerCallbackQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
        }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function getUserTelegramStats(chatId: string): Promise<UserTelegramStats | null> {
  // 1. Find user by telegram_chat_id
  const userRes = await pool.query<{
    wallet_address: string;
    telegram_username: string | null;
    total_monki_earned: string;
  }>(
    `SELECT wallet_address, telegram_username, total_monki_earned
       FROM users
      WHERE telegram_chat_id = $1`,
    [chatId],
  );

  if (userRes.rows.length === 0) return null;
  const user = userRes.rows[0];
  const walletAddress = user.wallet_address;

  // 2. Rewards row
  const rewardsRes = await pool.query<{
    claimable_monki: string;
    claimed_monki: string;
    staked_monki: string;
    claimable_pons: string;
    claimed_pons: string;
    reward_multiplier: string;
  }>(
    `SELECT claimable_monki, claimed_monki, staked_monki, claimable_pons, claimed_pons, reward_multiplier
       FROM rewards
      WHERE user_address = $1`,
    [walletAddress],
  );

  const r = rewardsRes.rows[0] ?? {
    claimable_monki: "0",
    claimed_monki: "0",
    staked_monki: "0",
    claimable_pons: "0",
    claimed_pons: "0",
    reward_multiplier: "1",
  };

  // 3. Power Rank
  const rankRes = await pool.query<{ rank: string }>(
    `SELECT COUNT(*) + 1 AS rank FROM users
      WHERE total_monki_earned > (SELECT total_monki_earned FROM users WHERE wallet_address = $1)`,
    [walletAddress],
  );

  // 4. Heartbeats
  const heartbeatsRes = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count
       FROM contributions c
       JOIN sessions s ON s.id = c.session_id
      WHERE s.user_address = $1`,
    [walletAddress],
  );

  // 5. Active agents
  const agentsRes = await pool.query<{
    id: string;
    name: string;
    current_power: string | number;
    healthy_threshold: string | number;
    warning_threshold: string | number;
    power_decay_rate: string | number;
    updated_at: Date | string;
    power_contributed: string | number;
    monki_earned: string | number;
  }>(
    `SELECT a.id, a.name, a.current_power, a.healthy_threshold, a.warning_threshold,
            a.power_decay_rate, a.updated_at, s.power_contributed, s.monki_earned
       FROM sessions s
       JOIN agents a ON a.id = s.agent_id
      WHERE s.user_address = $1 AND s.status = 'active'
      ORDER BY s.started_at DESC`,
    [walletAddress],
  );

  const now = new Date();
  const activeAgents = agentsRes.rows.map((row) => {
    const { power, state } = liveStateOf(
      {
        currentPower: Number(row.current_power ?? 80),
        powerDecayRate: Number(row.power_decay_rate ?? 1.0),
        healthyThreshold: Number(row.healthy_threshold ?? 80),
        warningThreshold: Number(row.warning_threshold ?? 30),
        updatedAt: row.updated_at,
      },
      now,
    );
    return {
      id: row.id,
      name: row.name,
      power,
      state,
      powerContributed: Number(row.power_contributed ?? 0),
      monkiEarned: Number(row.monki_earned ?? 0),
    };
  });

  const claimablePons = Number(r.claimable_pons || 0);
  const claimedPons = Number(r.claimed_pons || 0);

  return {
    walletAddress,
    telegramUsername: user.telegram_username,
    totalMonkiMined: Number(user.total_monki_earned || 0),
    claimableMonki: Number(r.claimable_monki || 0),
    claimedMonki: Number(r.claimed_monki || 0),
    stakedMonki: Number(r.staked_monki || 0),
    rewardMultiplier: Number(r.reward_multiplier || 1),
    claimablePons,
    claimedPons,
    totalPonsEarned: claimablePons + claimedPons,
    powerRank: Number(rankRes.rows[0]?.rank ?? 1),
    totalHeartbeats: Number(heartbeatsRes.rows[0]?.count ?? 0),
    activeAgents,
  };
}

export function formatStatsMessage(stats: UserTelegramStats): string {
  const shortAddr = truncateAddress(stats.walletAddress);

  let agentSection = "• <i>No active nurturing sessions currently.</i>";
  if (stats.activeAgents.length > 0) {
    agentSection = stats.activeAgents
      .map((a) => {
        const icon = a.state === "thriving" ? "🟢" : a.state === "idle" ? "🟡" : "🔴";
        return `• ${icon} <b>${a.name}</b>: ${a.state.toUpperCase()} (${fmtInt(a.power)}/100 power)`;
      })
      .join("\n");
  }

  return `🐒 <b>Monkii Labs Sentinel · Nurturer Telemetry</b>
━━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Wallet:</b> <code>${shortAddr}</code>
🏆 <b>Leaderboard Rank:</b> #${fmtInt(stats.powerRank)}
⚡ <b>Telemetry Heartbeats:</b> ${fmtInt(stats.totalHeartbeats)}

🍌 <b>$MONKI Mining (Proof-of-Life)</b>
• <b>Lifetime Mined:</b> ${fmtNum(stats.totalMonkiMined)} $MONKI
• <b>Claimable Accrual (Pre-TGE):</b> ${fmtNum(stats.claimableMonki)} $MONKI
• <b>Currently Staked:</b> ${fmtNum(stats.stakedMonki)} $MONKI
• <b>Mining Multiplier:</b> ${fmtNum(stats.rewardMultiplier, 2)}x

💎 <b>$PONS Staking Yield</b>
• <b>Claimable Epoch Yield:</b> ${fmtNum(stats.claimablePons)} $PONS
• <b>Total Claimed:</b> ${fmtNum(stats.claimedPons)} $PONS
• <b>Total Earned:</b> ${fmtNum(stats.totalPonsEarned)} $PONS

🤖 <b>Active Nurtured Fleet (${stats.activeAgents.length})</b>
${agentSection}
━━━━━━━━━━━━━━━━━━━━━━━━━
<i>Robinhood Chain L2 · Proof-of-Life Sentinel</i>`;
}

export function formatMonkiMessage(stats: UserTelegramStats): string {
  const shortAddr = truncateAddress(stats.walletAddress);
  return `🍌 <b>$MONKI Mining Telemetry</b>
━━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Wallet:</b> <code>${shortAddr}</code>
🏆 <b>Power Rank:</b> #${fmtInt(stats.powerRank)}

⛏️ <b>Telemetry Production</b>
• <b>Lifetime Mined:</b> ${fmtNum(stats.totalMonkiMined)} $MONKI
• <b>Claimable (Pre-TGE Lock):</b> ${fmtNum(stats.claimableMonki)} $MONKI
• <b>Withdrawn / Claimed:</b> ${fmtNum(stats.claimedMonki)} $MONKI

🥩 <b>Staking & Yield Multipliers</b>
• <b>Active Stake:</b> ${fmtNum(stats.stakedMonki)} $MONKI
• <b>Accrual Multiplier:</b> ${fmtNum(stats.rewardMultiplier, 2)}x
• <b>Telemetry Heartbeats:</b> ${fmtInt(stats.totalHeartbeats)}

💡 <i>$MONKI accumulates continuously via browser Proof-of-Life telemetry mining. Settlement opens at Token Generation Event (TGE).</i>`;
}

export function formatPonsMessage(stats: UserTelegramStats): string {
  const shortAddr = truncateAddress(stats.walletAddress);
  return `💎 <b>$PONS Staking Yield Breakdown</b>
━━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Wallet:</b> <code>${shortAddr}</code>
🥩 <b>Staked Pool Base:</b> ${fmtNum(stats.stakedMonki)} $MONKI

💰 <b>Yield Distribution</b>
• <b>Claimable Epoch Yield:</b> ${fmtNum(stats.claimablePons)} $PONS
• <b>Total Disbursed / Claimed:</b> ${fmtNum(stats.claimedPons)} $PONS
• <b>Lifetime $PONS Earned:</b> ${fmtNum(stats.totalPonsEarned)} $PONS

⏳ <b>Epoch Status:</b> Active daily disbursement
🌐 <i>Disbursements settle on Robinhood Chain Arbitrum Orbit L2.</i>`;
}

export function formatAgentsMessage(stats: UserTelegramStats, appUrl = env.appUrl): string {
  const shortAddr = truncateAddress(stats.walletAddress);
  if (stats.activeAgents.length === 0) {
    return `🤖 <b>Your Nurtured Fleet</b>
━━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Wallet:</b> <code>${shortAddr}</code>

You currently have no active nurturing sessions.
Start mining Proof-of-Life telemetry on the cockpit to nurture agents and protect them from vitality decay!

👉 <a href="${appUrl}/dashboard/agents">Open Fleet Cockpit →</a>`;
  }

  const list = stats.activeAgents
    .map((a) => {
      const icon = a.state === "thriving" ? "🟢" : a.state === "idle" ? "🟡" : "🔴";
      return `${icon} <b>${a.name}</b>
  • State: <b>${a.state.toUpperCase()}</b>
  • Power: <b>${fmtInt(a.power)} / 100</b>
  • Power Contributed: +${fmtInt(a.powerContributed)}
  • $MONKI Earned: ${fmtNum(a.monkiEarned)} $MONKI
  • <a href="${appUrl}/dashboard/agents/${a.id}">Nurture ${a.name} →</a>`;
    })
    .join("\n\n");

  return `🤖 <b>Your Nurtured Fleet (${stats.activeAgents.length})</b>
━━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Wallet:</b> <code>${shortAddr}</code>

${list}

━━━━━━━━━━━━━━━━━━━━━━━━━
<i>Sentinel watches vitality 24/7 and alerts you before decay occurs.</i>`;
}

export function formatHelpMessage(isLinked: boolean, appUrl = env.appUrl): string {
  if (!isLinked) {
    return `🐒 <b>Monkii Labs Sentinel Bot Help</b>
━━━━━━━━━━━━━━━━━━━━━━━━━
You are currently not linked to a Monkii Labs account.

<b>To Link:</b>
1. Open <a href="${appUrl}/dashboard/alerts">monkiilabs.app/dashboard/alerts</a>
2. Copy your 6-character pairing code
3. Reply here: <code>/start &lt;YOUR_CODE&gt;</code>`;
  }

  return `🐒 <b>Monkii Labs Sentinel Bot Commands</b>
━━━━━━━━━━━━━━━━━━━━━━━━━
Use the menu buttons below or type any command:

📊 <code>/stats</code> — Full overview of your rank, mining & yield
🍌 <code>/monki</code> — $MONKI mining telemetry & pre-TGE accruals
💎 <code>/pons</code> — $PONS staking yield & claimable rewards
🤖 <code>/agents</code> — Status & power of your nurtured agents
🔗 <code>/unlink</code> — Unlink your Telegram account from this wallet
❓ <code>/help</code> — Show this guide

🌐 <b>Cockpit:</b> <a href="${appUrl}/dashboard">monkiilabs.app/dashboard</a>`;
}

export async function handleUnlink(chatId: string): Promise<string> {
  const res = await pool.query(
    `UPDATE users
        SET telegram_chat_id = NULL, telegram_username = NULL, telegram_link_code = NULL
      WHERE telegram_chat_id = $1`,
    [chatId],
  );
  if ((res.rowCount ?? 0) > 0) {
    return `✅ <b>Account Unlinked</b>\nYour Telegram account has been disconnected from your Monkii Labs wallet.\n\nYou will no longer receive alerts. You can re-link anytime from the dashboard with <code>/start &lt;code&gt;</code>.`;
  }
  return `ℹ️ <b>No Linked Account</b>\nThis Telegram account is not currently linked to any wallet.`;
}

export async function handleTelegramUpdate(update: any): Promise<void> {
  // Handle callback queries (inline button clicks)
  if (update.callback_query) {
    const cb = update.callback_query;
    const chatId = String(cb.message?.chat?.id ?? cb.from?.id);
    await answerCallbackQuery(cb.id);

    if (cb.data === "refresh_stats") {
      const stats = await getUserTelegramStats(chatId);
      if (stats) {
        await sendTelegramMessage(chatId, formatStatsMessage(stats), {
          reply_markup: getStatsInlineKeyboard(),
        });
      } else {
        await sendTelegramMessage(
          chatId,
          "🐒 <b>Account Not Linked</b>\nPlease link your wallet first at monkiilabs.app/dashboard/alerts.",
        );
      }
    }
    return;
  }

  const msg = update.message;
  if (!msg?.text) return;
  const chatId = String(msg.chat.id);
  const text = msg.text.trim();
  const lower = text.toLowerCase();

  // 1. Account linking (/start <code>)
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
        const stats = await getUserTelegramStats(chatId);
        const welcomeText =
          `🐒 <b>Welcome to Monkii Labs!</b>\nYour Telegram is now linked to wallet <code>${stats ? truncateAddress(stats.walletAddress) : ""}</code>.\n\nYou will receive real-time alerts whenever your nurtured agents lose vitality. Use the buttons below to check your stats anytime!`;
        await sendTelegramMessage(chatId, welcomeText, {
          reply_markup: MAIN_KEYBOARD,
        });
        if (stats) {
          await sendTelegramMessage(chatId, formatStatsMessage(stats), {
            reply_markup: getStatsInlineKeyboard(),
          });
        }
        return;
      }
    }

    // /start without code or invalid code: check if already linked
    const stats = await getUserTelegramStats(chatId);
    if (stats) {
      await sendTelegramMessage(
        chatId,
        `🐒 <b>Welcome back!</b>\nYour Telegram is linked to wallet <code>${truncateAddress(stats.walletAddress)}</code>.\n\nHere is your current telemetry standing:`,
        { reply_markup: MAIN_KEYBOARD },
      );
      await sendTelegramMessage(chatId, formatStatsMessage(stats), {
        reply_markup: getStatsInlineKeyboard(),
      });
      return;
    }

    await sendTelegramMessage(
      chatId,
      `🐒 <b>Monkii Labs Sentinel Bot</b>\nTo link your account, navigate to the Monkii Labs cockpit, copy your pairing code, and send <code>/start &lt;code&gt;</code> here.\n\n👉 <a href="${env.appUrl}/dashboard/alerts">Generate Pairing Code</a>`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🌐 Open Pairing Page", url: `${env.appUrl}/dashboard/alerts` }],
          ],
        },
      },
    );
    return;
  }

  // Check if user is linked for subsequent commands
  const stats = await getUserTelegramStats(chatId);

  // 2. Unlink command
  if (lower === "/unlink" || lower === "unlink") {
    const reply = await handleUnlink(chatId);
    await sendTelegramMessage(chatId, reply, {
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  // 3. Help command
  if (lower === "/help" || lower === "❓ help" || lower === "help") {
    await sendTelegramMessage(chatId, formatHelpMessage(Boolean(stats)), {
      reply_markup: stats ? MAIN_KEYBOARD : undefined,
    });
    return;
  }

  // 4. Cockpit link
  if (lower === "🌐 open cockpit" || lower === "/cockpit") {
    await sendTelegramMessage(
      chatId,
      `🚀 <b>Monkii Labs Cockpit</b>\nAccess the decentralized telemetry cockpit:\n👉 <a href="${env.appUrl}/dashboard">monkiilabs.app/dashboard</a>`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🌐 Launch Dashboard", url: `${env.appUrl}/dashboard` }],
          ],
        },
      },
    );
    return;
  }

  // If user is not linked, prompt them to link
  if (!stats) {
    await sendTelegramMessage(
      chatId,
      `🐒 <b>Account Not Linked</b>\nYour Telegram is not connected to a Monkii Labs wallet yet.\n\nTo view your mined $MONKI, earned $PONS, and agent telemetry, link your account:\n1. Go to <a href="${env.appUrl}/dashboard/alerts">monkiilabs.app/dashboard/alerts</a>\n2. Copy your pairing code\n3. Reply: <code>/start &lt;code&gt;</code>`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🌐 Get Pairing Code", url: `${env.appUrl}/dashboard/alerts` }],
          ],
        },
      },
    );
    return;
  }

  // 5. Stats command
  if (lower === "/stats" || lower === "📊 my stats" || lower === "/balance") {
    await sendTelegramMessage(chatId, formatStatsMessage(stats), {
      reply_markup: getStatsInlineKeyboard(),
    });
    return;
  }

  // 6. Monki mining command
  if (lower === "/monki" || lower === "🍌 mined $monki" || lower === "/mining") {
    await sendTelegramMessage(chatId, formatMonkiMessage(stats), {
      reply_markup: getStatsInlineKeyboard(),
    });
    return;
  }

  // 7. Pons yield command
  if (lower === "/pons" || lower === "💎 $pons yield" || lower === "/yield") {
    await sendTelegramMessage(chatId, formatPonsMessage(stats), {
      reply_markup: getStatsInlineKeyboard(),
    });
    return;
  }

  // 8. Nurtured fleet command
  if (lower === "/agents" || lower === "🤖 nurtured fleet" || lower === "/fleet") {
    await sendTelegramMessage(chatId, formatAgentsMessage(stats), {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🤖 Open Fleet Cockpit", url: `${env.appUrl}/dashboard/agents` }],
        ],
      },
    });
    return;
  }

  // Default unknown text for linked user: show main stats and keyboard
  await sendTelegramMessage(
    chatId,
    `🐒 Command not recognized. Use the menu buttons below or type <code>/help</code>.`,
    { reply_markup: MAIN_KEYBOARD },
  );
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

