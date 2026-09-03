/** Centralised, typed access to Monkii Labs environment configuration on Robinhood Chain. */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  version: "1.0.0",
  databaseUrl: process.env.DATABASE_URL ?? "",
  corsOrigins: (process.env.CORS_ORIGIN ?? "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  // --- Auth ---
  jwtSecret: process.env.JWT_SECRET ?? "monkii-labs-dev-jwt-secret-key-32chars",
  sessionTtlSeconds: Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 24 * 7),
  nonceTtlSeconds: Number(process.env.NONCE_TTL_SECONDS ?? 600),

  // --- Admin ---
  adminMasterKey: process.env.MASTER_ADMIN_KEY ?? process.env.ADMIN_MASTER_KEY ?? "monkii-master-key",

  // --- Robinhood Chain (Arbitrum Orbit L2 - EVM) ---
  robinhoodChainRpcUrl: process.env.ROBINHOOD_CHAIN_RPC_URL ?? "https://rpc.mainnet.chain.robinhood.com",
  robinhoodChainId: Number(process.env.ROBINHOOD_CHAIN_ID ?? 4663),
  rewardPoolPrivateKey: (process.env.REWARD_POOL_PRIVATE_KEY ?? "").startsWith("0x")
    ? (process.env.REWARD_POOL_PRIVATE_KEY as `0x${string}`)
    : (`0x${process.env.REWARD_POOL_PRIVATE_KEY}` as `0x${string}`),
  rewardPoolPublicKey: process.env.REWARD_POOL_PUBLIC_KEY ?? "0x566332F349Adbb909eFB0382316A63C255F3D7F5",
  ponsTokenAddress: process.env.PONS_TOKEN_ADDRESS ?? "0x39dbed3a2bd333467115de45665cc57f813c4571",
  metaStockTokenAddress: process.env.META_STOCK_TOKEN_ADDRESS ?? "",

  // --- $PONS Staking Reward Epochs ---
  ponsRewardPerMonki: Number(process.env.PONS_REWARD_PER_MONKI ?? 0.001),
  ponsStakeLockHours: Number(process.env.PONS_STAKE_LOCK_HOURS ?? 24),
  ponsMinStakeForPons: Number(process.env.PONS_MIN_STAKE_FOR_PONS ?? 100),
  ponsEpochAnchor: process.env.PONS_EPOCH_ANCHOR ?? "2026-09-01T00:00:00.000Z",

  // --- Proof-of-Life Heartbeat (PoW) ---
  powDifficulty: Number(process.env.POW_DIFFICULTY ?? (process.env.NODE_ENV === "test" ? 8 : 10)),
  powChallengeTtlSeconds: Number(process.env.POW_CHALLENGE_TTL_SECONDS ?? 120),
  powBasePower: Number(process.env.POW_BASE_POWER ?? 10),
  powBaseMonki: Number(process.env.POW_BASE_MONKI ?? 5.0),
  heartbeatMinIntervalSeconds: Number(process.env.HEARTBEAT_MIN_INTERVAL_SECONDS ?? 3),

  // --- Power-eval job ---
  powerEvalIntervalSeconds: Number(process.env.POWER_EVAL_INTERVAL_SECONDS ?? 60),
  recentNurturerHours: Number(process.env.RECENT_NURTURER_HOURS ?? 24),

  // --- Heartbeat intensity offsets ---
  intensityOffsets: { light: -2, standard: 0, max: 2 } as Record<string, number>,

  // --- Telegram notifications ---
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramBotUsername: (process.env.TELEGRAM_BOT_USERNAME ?? "").replace(/^@/, ""),
  telegramWebhookUrl: process.env.TELEGRAM_WEBHOOK_URL ?? "",
  appUrl: process.env.APP_URL ?? "https://monkiilabs.app",
};
