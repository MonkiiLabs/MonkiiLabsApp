# 🐒 MonkiiLabs Handoff & Technical Architecture Blueprint
> **Complete Technical Guide, Codebase Audit & Transition Blueprint from AnsemAgents to MonkiiLabs**
> *Prepared for: Engineering Team & AI Agents*
> *Architecture: Solana Web3, Bun/Node.js, PostgreSQL, TanStack Router (Vite), React Native Mobile Node (Expo Bare)*

---

## 📑 Table of Contents
1. [Executive Summary & Product Vision](#1-executive-summary--product-vision)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Cryptographic & Algorithmic Engines](#3-cryptographic--algorithmic-engines)
   - 3.1 [Proof-of-Life (PoL) Keccak-256 Mining Engine](#31-proof-of-life-pol-keccak-256-mining-engine)
   - 3.2 [Agent Vitality & Exponential Power Decay](#32-agent-vitality--exponential-power-decay)
   - 3.3 [Reward Accrual, Multipliers & Companion Buffs](#33-reward-accrual-multipliers--companion-buffs)
   - 3.4 [24-Hour $ANSEM / $MONKII Epoch Disbursal Engine](#34-24-hour-ansem--monkii-epoch-disbursal-engine)
4. [Database Schema & Migration History](#4-database-schema--migration-history)
5. [Backend API Endpoint Reference](#5-backend-api-endpoint-reference)
6. [Web Application Architecture (React + Vite + TanStack)](#6-web-application-architecture-react--vite--tanstack)
7. [Mobile Node Application Architecture (React Native)](#7-mobile-node-application-architecture-react-native)
8. [Solana Smart Contracts & Metaplex NFT Integration](#8-solana-smart-contracts--metaplex-nft-integration)
9. [Step-by-Step Rebranding Checklist: AnsemAgents ➔ MonkiiLabs](#9-step-by-step-rebranding-checklist-ansemagents--monkiilabs)
10. [Environment Variables & Deployment Guide](#10-environment-variables--deployment-guide)

---

## 1. Executive Summary & Product Vision

### 1.1 What is the Platform?
The platform is the **"Tamagotchi for Autonomous AI Agents"** — a decentralized gamified ecosystem where users nurture autonomous AI agents through **cryptographic Proof-of-Life (PoL)** heartbeats. 

AI agents deployed on-chain or off-chain continuously lose **Vitality (Power)** over time via a decay curve. Users connect their machines or mobile phones to run lightweight Keccak-256 PoW computations ("nurturing"), which:
1. **Restores the agent's Vitality** (keeping them in the `thriving` state instead of `idle` or `fading`).
2. **Accrues native ecosystem tokens ($AGENTS / $MONKII)** in real-time.
3. **Qualifies users for 24-Hour Epoch Disbursals** backed by protocol treasury pools.
4. **Levels up Companion NFTs** that grant permanent mining acceleration and decay mitigation.

---

## 2. High-Level System Architecture

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                  CLIENT APPLICATIONS                   │
                                  ├────────────────────────────┬───────────────────────────┤
                                  │   Desktop / Web Cockpit    │   Mobile Companion Node   │
                                  │  (React 18 + TanStack Vite)│   (React Native OLED App) │
                                  └─────────────┬──────────────┴─────────────┬─────────────┘
                                                │                            │
                                   Solana Wallet│ed25519 Auth         6-Digit│Pairing PIN
                                                ▼                            ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND API & ORCHESTRATOR (BUN/EXPRESS)                   │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ • Authentication Service (Solana Nonce Verification + Hardware Isolated JWT)              │
│ • Proof-of-Life Engine (Keccak Challenge Generator + Nonce Verifier)                     │
│ • Vitality Decay Engine (Cron-driven Power Decay & State Transitions)                     │
│ • Staking & Epoch Scheduler (24h Snapshot Engine + Staking Multipliers)                  │
│ • Metaplex Core NFT Service (Minting, Metadata URIs, Inventory Equip/Unequip)            │
│ • Telegram Bot Service (Real-time Vitality Warnings & Airdrop Notifications)             │
└──────────────────────────────────────────┬───────────────────────────────────────────────┘
                                           │
                       ┌───────────────────┴───────────────────┐
                       ▼                                       ▼
    ┌─────────────────────────────────────┐ ┌─────────────────────────────────────┐
    │     POSTGRESQL (NEON / SUPABASE)    │ │      SOLANA MAINNET-BETA / DEVNET   │
    ├─────────────────────────────────────┤ ├─────────────────────────────────────┤
    │ • users & auth_tokens               │ │ • Ecosystem SPL Tokens              │
    │ • agents & nurture_sessions         │ │ • Metaplex Companion NFTs           │
    │ • heartbeat_proofs & rewards        │ │ • Treasury Reward Pool Wallet       │
    │ • companions & equip_slots          │ │ • On-Chain Claim Contracts          │
    │ • protocol_settings & airdrops      │ └─────────────────────────────────────┘
    └─────────────────────────────────────┘
```

---

## 3. Cryptographic & Algorithmic Engines

### 3.1 Proof-of-Life (PoL) Keccak-256 Mining Engine
Instead of arbitrary captcha clicks, agent vitality is sustained by genuine cryptographic work.

#### The Hash Challenge:
For each heartbeat, the server issues a random challenge:
$$\text{seed} \in \{0, 1\}^{256}, \quad \text{difficulty} \in [8, 20]$$

The client runs a nonced Keccak-256 hashing loop:
$$\text{hash} = \text{keccak\_256}(\text{seed} \parallel \text{":"} \parallel \text{nonce})$$

A solution is valid if:
$$\text{count\_leading\_zero\_bits}(\text{hash}) \ge \text{difficulty}$$

#### Difficulty Scaling by Compute Intensity:
Configured in [`backend/src/lib/intensity.ts`](file:///home/skipp/Documents/gigs/ansemagents/backend/src/lib/intensity.ts):
- **`LIGHT`**: Base Difficulty (e.g. 8 bits). Low CPU/battery usage.
- **`STANDARD`**: Base Difficulty + 2 bits. Balanced yield.
- **`MAX`**: Base Difficulty + 4 bits. Maximum power restoration and highest $AGENTS reward accrual.

---

### 3.2 Agent Vitality & Exponential Power Decay
Agents maintain a `power` score in database. Every minute, the background worker [`backend/src/services/power-eval.ts`](file:///home/skipp/Documents/gigs/ansemagents/backend/src/services/power-eval.ts) applies decay:

$$P_{t+1} = \max(0, P_t - \text{decay\_rate\_per\_minute} \times (1 - \text{companion\_decay\_reduction}))$$

#### State Transitions:
- **`thriving`**: $P_t \ge \text{healthyThreshold}$ (typically $\ge 80$ pts) $\rightarrow$ Full staking yield & bonus multiplier.
- **`idle`**: $\text{warningThreshold} \le P_t < \text{healthyThreshold}$ ($30 - 79$ pts) $\rightarrow$ Standard yield.
- **`fading`**: $P_t < \text{warningThreshold}$ ($< 30$ pts) $\rightarrow$ Telegram warning sent; zero epoch rewards.

---

### 3.3 Reward Accrual, Multipliers & Companion Buffs
When a valid PoL block is submitted via `POST /api/sessions/heartbeat`:

$$\text{Earned } \$AGENTS = \text{BaseRate} \times \text{IntensityMultiplier} \times \text{StakingMultiplier} \times \left(1 + \sum \text{CompanionBuffs}\right)$$

1. **Staking Multiplier ($1.0\times - 3.0\times$):**
   - Locking accrued $AGENTS into the internal staking ledger scales the multiplier up to $3.0\times$.
2. **Companion NFT Buffs (up to $+45\%$):**
   - Each agent has 3 equipment slots for minted Companion NFTs.
   - Each NFT imparts bonuses like $+10\%$ Earn Boost or $-25\%$ Decay Mitigation.

---

### 3.4 24-Hour Epoch Disbursal Engine
Located in [`backend/src/lib/ansem-epoch.ts`](file:///home/skipp/Documents/gigs/ansemagents/backend/src/lib/ansem-epoch.ts):
- Every 24 hours at `00:00:00 UTC`, the global snapshot accrues pool rewards.
- Stakers with active nurturing activity receive proportional payouts from the protocol treasury pool.

---

## 4. Database Schema & Migration History

All SQL migrations live in [`backend/db/migrations/`](file:///home/skipp/Documents/gigs/ansemagents/backend/db/migrations/):

| Migration | File | Description |
|---|---|---|
| **001** | `001_initial.sql` | Core schema: `users`, `agents`, `nurture_sessions`, `heartbeat_proofs`, `user_rewards`, `staking_ledgers`, `mobile_pair_codes` |
| **002** | `002_ansem_epoch_rewards.sql` | 24-hour epoch reward fields and history tracking |
| **003** | `003_reset_ansem_and_stakes.sql` | Ledger reset & balance normalization utilities |
| **004** | `004_admin_airdrops.sql` | Admin direct reward allocation & user air-dropping table |
| **005** | `005_admin_emails.sql` | Admin notification and communication tables |
| **006** | `006_companions.sql` | Metaplex Companion NFTs: `companions_catalog`, `user_companions`, and 3-slot equip links |
| **007** | `007_protocol_settings.sql` | Dynamic runtime settings toggles (claims on/off, difficulty offsets) |
| **008** | `008_claim_authorizations.sql` | Replay-proof cryptographic claim signatures for on-chain claims |

---

## 5. Backend API Endpoint Reference

### 🔐 Auth & Pairing
- `POST /api/auth/nonce` $\rightarrow$ Generates random ed25519 challenge for Solana wallet.
- `POST /api/auth/verify` $\rightarrow$ Verifies wallet signature and returns JWT `auth_token`.
- `GET /api/auth/me` $\rightarrow$ Returns authenticated user profile, wallet, and settings.
- `POST /api/mobile/code` $\rightarrow$ (Web) Generates 6-digit numeric pairing PIN.
- `POST /api/mobile/link` $\rightarrow$ (Mobile) Exchanges 6-digit PIN for authenticated JWT.

### 🤖 Agents & Fleet
- `GET /api/agents` $\rightarrow$ Lists all fleet agents with real-time power, state, and category.
- `GET /api/agents/:id` $\rightarrow$ Returns detailed metrics, thresholds, and equipped companion buffs.
- `POST /api/agents/register` $\rightarrow$ Registers new custom agent with metadata and thresholds.

### ⚡ Proof-of-Life Sessions
- `POST /api/sessions/start` $\rightarrow$ Initializes session `{ agentId, intensity }` and returns initial `{ seed, difficulty }`.
- `POST /api/sessions/heartbeat` $\rightarrow$ Submits `{ sessionId, seed, nonce }`. Verifies Keccak PoW, increases agent power, credits $AGENTS, returns next challenge.
- `POST /api/sessions/stop` $\rightarrow$ Gracefully terminates nurturing session.

### 🪙 Staking & 24h Epoch
- `GET /api/staking/status` $\rightarrow$ Returns staked balance, claimable balance, active multiplier, and `nextAnsemEpochAt`.
- `POST /api/staking/stake` $\rightarrow$ Off-chain ledger lock: converts claimable $AGENTS to staked $AGENTS, recalculating multiplier.
- `POST /api/staking/unstake` $\rightarrow$ Off-chain ledger unlock: returns staked $AGENTS to claimable.

### 🦄 Companion NFTs (Metaplex Core)
- `GET /api/companions/catalog` $\rightarrow$ Public catalog of available Companion NFT species and buff stats.
- `GET /api/companions/inventory` $\rightarrow$ User's owned/minted Companion NFTs with equip state.
- `POST /api/companions/equip` $\rightarrow$ Equips a user companion NFT to `{ agentId, slotIndex }`.
- `POST /api/companions/unequip` $\rightarrow$ Detaches companion NFT back to inventory.
- `POST /api/companions/claim-milestone` $\rightarrow$ Free on-chain mint for users achieving power milestones.

### 📊 Dashboard, Economics & Admin
- `GET /api/dashboard/summary` $\rightarrow$ Complete user stats: rank, total proofs, lifetime rewards.
- `GET /api/economics/pool-status` $\rightarrow$ Treasury backing reserve balance.
- `POST /api/admin/*` $\rightarrow$ Protected controls for airdrops, difficulty adjustments, and emergency stops.

---

## 6. Web Application Architecture (React + Vite + TanStack)

- **Entry Point:** [`src/router.tsx`](file:///home/skipp/Documents/gigs/ansemagents/src/router.tsx) & [`src/routes/`](file:///home/skipp/Documents/gigs/ansemagents/src/routes/)
- **State & Routes:**
  - `/` ([`src/routes/index.tsx`](file:///home/skipp/Documents/gigs/ansemagents/src/routes/index.tsx)) $\rightarrow$ Hero landing page, real-time agent carousel, live statistics.
  - `/dashboard` ([`src/routes/dashboard.tsx`](file:///home/skipp/Documents/gigs/ansemagents/src/routes/dashboard.tsx)) $\rightarrow$ Nurturing cockpit, multi-threaded WebWorker Keccak hashing, on-chain withdrawal panel.
  - `/agents/$id` ([`src/routes/agents/`](file:///home/skipp/Documents/gigs/ansemagents/src/routes/agents/)) $\rightarrow$ Individual agent profile, historical telemetry charts, companion equipment slots.
  - `/leaderboard` ([`src/routes/leaderboard.tsx`](file:///home/skipp/Documents/gigs/ansemagents/src/routes/leaderboard.tsx)) $\rightarrow$ Global power ranks and top nurturing nodes.
  - `/mobile` ([`src/routes/mobile.tsx`](file:///home/skipp/Documents/gigs/ansemagents/src/routes/mobile.tsx)) $\rightarrow$ Mobile APK download portal and 6-digit pairing code generator.
  - `/admin` ([`src/routes/admin.tsx`](file:///home/skipp/Documents/gigs/ansemagents/src/routes/admin.tsx)) $\rightarrow$ Protocol parameter toggles, treasury distribution controls, telemetry inspector.

---

## 7. Mobile Node Application Architecture (React Native)

Located entirely within [`android/App.tsx`](file:///home/skipp/Documents/gigs/ansemagents/android/App.tsx) with native Expo bare setup:

- **Apple OLED Dark Aesthetic:** Pure `#000000` pitch-black background with Obsidian cards (`#0c130e`) and Acid Green (`#75ff52`) highlights.
- **Two-Phased Onboarding Gate:**
  1. **Phase 1 (Welcome Hero):** 16:9 banner, centered title `"The Tamagotchi of Agents"`, value proposition, and feature badges.
  2. **Phase 2 (PIN Pairing):** 6-digit numeric input that authenticates against `/api/mobile/link` without requiring seed phrases.
- **4-Tab Floating Capsule Navigation:**
  1. **Home:** Featured Agent Hero Card + 2-column rounded fleet grid + Apple Filter & Sort modal.
  2. **Fleet & Nurture:** Agent detail sheet, 3 compute intensities (`LIGHT`, `STANDARD`, `MAX`), companion NFT equip modal, live phosphor bar **Telemetry** chart.
  3. **Staking:** Live ticking 24h Epoch clock with cycle progress bar, in-app $AGENTS staking form with quick pills (`25%`, `50%`, `MAX`), and claim guidance card.
  4. **Account / Node:** Connected wallet details, lifetime telemetry stats, and device unlink.

---

## 8. Solana Smart Contracts & Metaplex NFT Integration

### 8.1 SPL Reward Distribution Contract
Located in [`contracts/RewardDistribution.sol`](file:///home/skipp/Documents/gigs/ansemagents/contracts/RewardDistribution.sol) (EVM equivalent reference) and implemented in Solana Web3:
- Enforces replay protection via unique random nonces.
- Verifies server backend claim signatures before releasing pool funds.

### 8.2 Metaplex Core Companion NFTs
Located in [`backend/src/lib/metaplex.ts`](file:///home/skipp/Documents/gigs/ansemagents/backend/src/lib/metaplex.ts):
- Mints Metaplex Core assets on Solana Mainnet/Devnet.
- Serves dynamic JSON metadata with on-chain attributes via `/api/companions/metadata/:slug`.

---

## 9. Step-by-Step Rebranding Checklist: AnsemAgents ➔ MonkiiLabs

To transition the repository to **MonkiiLabs**, follow this checklist:

### 1. Global Brand & String Replacement
- [ ] Replace `AnsemAgents` $\rightarrow$ `MonkiiLabs`
- [ ] Replace `ansemagents.app` $\rightarrow$ `monkiilabs.io` (or your domain)
- [ ] Replace `$ANSEM` $\rightarrow$ `$MONKII`
- [ ] Replace `$AGENTS` $\rightarrow$ `$BANANA` (or `$LABS`)

### 2. Contract & Token Address Updates
- [ ] In [`android/App.tsx`](file:///home/skipp/Documents/gigs/ansemagents/android/App.tsx) and [`src/lib/constants.ts`](file:///home/skipp/Documents/gigs/ansemagents/src/lib/constants.ts):
  - Update `AGENTS_CA` and `ANSEM_CA` to the new MonkiiLabs SPL mint addresses.
  - Update `API_URL` to the new backend endpoint.

### 3. Visual Assets Replacement
- [ ] Replace [`android/assets/16:9-banner.png`](file:///home/skipp/Documents/gigs/ansemagents/android/assets/16:9-banner.png) with MonkiiLabs banner.
- [ ] Replace [`public/logo.png`](file:///home/skipp/Documents/gigs/ansemagents/public/logo.png) with MonkiiLabs logo.
- [ ] Replace app icons in `android/app/src/main/res/`.

### 4. Database Setup & Seed
- [ ] Create a fresh PostgreSQL instance on Neon.tech.
- [ ] Run migrations: `bun run migrate` inside `backend/`.
- [ ] Seed default agents tailored for MonkiiLabs in `backend/src/lib/agents.ts`.

---

## 10. Environment Variables & Deployment Guide

### Backend `.env` (`backend/.env`)
```bash
# Server & Environment
PORT=4000
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-32-chars-min
DATABASE_URL=postgresql://user:pass@ep-cool-db.us-east-2.aws.neon.tech/monkiilabs?sslmode=require

# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
POOL_WALLET_PRIVATE_KEY=[12,34,56,...base58-or-byte-array]
CLAIM_AUTHORITY_PRIVATE_KEY=[98,76,54,...]

# Token Mints
AGENTS_MINT_ADDRESS=YourAgentsTokenMintAddress111111111111111111
ANSEM_MINT_ADDRESS=YourAnsemTokenMintAddress111111111111111111

# PoW Difficulty Offsets
POW_BASE_DIFFICULTY=8
POW_OFFSET_LIGHT=0
POW_OFFSET_STANDARD=2
POW_OFFSET_MAX=4

# Telegram Bot Alerts (Optional)
TELEGRAM_BOT_TOKEN=123456789:ABCDefghIJKlmNoPQRstuVWXyz
```

### Frontend Web `.env` (`.env`)
```bash
VITE_API_URL=https://api.monkiilabs.io
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_SOLANA_NETWORK=mainnet-beta
```

### Deployment Commands
```bash
# Backend (Bun)
cd backend
bun install
bun run db:migrate
bun run start

# Frontend (Vite / Vercel / Lovable)
bun install
bun run build

# Mobile App (Expo / Android)
cd android
bun install
bun run ts:check
npx expo run:android --variant release
```

---
*End of MonkiiLabs Technical Handoff Blueprint.*
