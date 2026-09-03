# Monkii Labs

![CI](https://github.com/notadeveloper7/monkiilabs/actions/workflows/backend.yml/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-1.x-000000?logo=bun&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Robinhood Chain](https://img.shields.io/badge/Robinhood_Chain-Arbitrum_Orbit_L2-00C805?logo=ethereum&logoColor=white)

**Monkii Labs** is the Tamagotchi for Autonomous AI Agents, built natively on **Robinhood Chain** (Ethereum Layer 2). Retail participants sustain agent vitality through lightweight, browser-based **Proof-of-Life** heartbeat computations, earn project-native **$MONKI** compute receipts, and stake to earn liquid **$PONS** launchpad tokens and tokenized **$META stock** in a 50:50 yield model.

---

## Core Features

| Feature | Description | Platform Surface |
|---|---|---|
| **Proof-of-Life Heartbeat** | In-browser `keccak256` hashing challenges solved via Web Worker to recharge agent vitality | Web Cockpit / Robinhood View |
| **Visible Agent Vitality** | Real-time state indicators: `Thriving` ($\ge 80$), `Idle` ($30–79$), and `Fading` ($<30$) | Agent Status Monitor |
| **$MONKI Compute Mining** | Project-native internal participation receipt earned exclusively through verified compute | Rewards Station |
| **24-Hour Staking Epochs** | Stake $MONKI to capture liquid yield disbursed every 24h at `00:00:00 UTC` | Epoch Engine |
| **50:50 $PONS + $META Yield** | 50% paid in liquid $PONS tokens, 50% paid in tokenized $META Stock Tokens on Robinhood Chain | Robinhood Settlement Rails |
| **Companion Collectibles** | Equip 1–3 Companions per agent for passive $MONKI mining boosts and vitality decay mitigation | Companion Equipment Dock |

---

## How It Works

| Step | Action | Mechanism |
|---|---|---|
| **1. Connect** | User connects with Robinhood credentials / Web3 EVM wallet | EIP-712 gasless challenge verification |
| **2. Nurture** | Client requests PoL challenge and solves nonced Keccak-256 in background | Web Worker executes PoW hashing |
| **3. Vitalize** | Nonce submitted to backend; agent power increments | Prevents agent power decay |
| **4. Accrue** | Verified work issues project-native $MONKI balance | Off-chain double-entry rewards ledger |
| **5. Stake** | User locks $MONKI into the 24-hour staking pool | Qualifies for daily protocol reward snapshots |
| **6. Disburse** | Stakers receive daily rewards directly to their address | 100% $PONS (Phase 1) $\rightarrow$ 50:50 $PONS / $META (Phase 2) |

---

## Public API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/health` | System health, service timestamp, and L2 network | No |
| `GET` | `/` | API versioning, token registry, and basic info | No |
| `GET` | `/api/agents` | Fleet telemetry, power levels, and operational states | No |
| `POST` | `/api/sessions/start` | Initialize heartbeat session, receive `{ seed, difficulty }` | Yes |
| `POST` | `/api/sessions/heartbeat` | Submit nonced PoW block, verify hash, award $MONKI | Yes |
| `GET` | `/api/staking/status` | Current staked $MONKI, epoch timer, and estimated yields | Yes |
| `POST` | `/api/staking/stake` | Lock $MONKI into staking pool to activate multiplier | Yes |

---

## Repository Structure

```
monkiilabs/
├── .github/workflows/
│   └── backend.yml           # 4-stage CI/CD (Test, Build-Push, Release, Deploy)
├── backend/                  # Self-contained Bun + Express + PostgreSQL service
│   ├── Dockerfile            # Multi-stage Bun production container
│   ├── db/migrations/        # Raw SQL transactional schema migrations
│   │   └── 001_initial.sql   # Core tables: users, agents, sessions, rewards
│   ├── src/
│   │   ├── app.ts            # Express application export (for tests)
│   │   ├── index.ts          # Server entry point + migration trigger
│   │   ├── db/               # PostgreSQL pool and migration runner
│   │   └── routes/           # REST routes (health, agents, sessions, staking)
│   └── tests/                # Bun test suites with supertest
├── src/                      # Frontend TanStack React + Vite app
│   ├── routes/               # TanStack route tree (__root, index)
│   ├── lib/                  # Shared utilities (clsx, tailwind-merge)
│   ├── index.css             # Tailwind + Monkii brand tokens
│   ├── router.tsx            # Router configuration
│   └── main.tsx              # React DOM mounting
├── technical-docs/           # Product specifications & architectural PRDs
├── components.json           # shadcn/ui configuration
├── tailwind.config.ts        # Tailwind configuration
├── vite.config.ts            # Vite bundler configuration
└── package.json              # Frontend dependencies
```

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (v1.2+)
- [Node.js](https://nodejs.org) (v20+)
- [PostgreSQL](https://www.postgresql.org) (v15+)

### 1. Clone & Setup
```bash
git clone https://github.com/notadeveloper7/monkiilabs.git
cd monkiilabs
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
bun install
bun run check
bun test
bun run dev
```

### 3. Frontend Setup
```bash
# In project root
cp .env.example .env
bun install
bun run dev
```

---

## Implementation Roadmap

| Phase | Milestone | Focus Areas |
|---|---|---|
| **Phase 1** | Foundation & Proof-of-Life | Web cockpit, Robinhood Connect SSO, Web Worker Keccak-256 solver, $MONKI ledger |
| **Phase 2** | Staking & $PONS Epochs | 24-hour epoch payout engine, liquid $PONS rewards, Companion inventory |
| **Phase 3** | 50:50 $META Stock Split | Robinhood Chain $META Stock Token integration, dual crypto-equity disbursal |
| **Phase 4** | Fleet & Mobile Scale | React Native OLED mobile nodes, autonomous agent fleet marketplace |

---

## Tech Stack

- **Runtime & Backend:** Bun 1.x, TypeScript, Express, PostgreSQL (`pg`)
- **Frontend:** React 18, Vite 6, TanStack Router, Tailwind CSS, shadcn/ui
- **Blockchain / L2:** Robinhood Chain (Arbitrum Orbit Layer 2, 100ms blocks, ETH gas)
- **CI/CD & Hosting:** GitHub Actions, Docker (GHCR), Vercel (Frontend), Render (Backend)
