# Contributing to Monkii Labs

Thank you for your interest in contributing to **Monkii Labs**! We are building the decentralized nurturing layer for autonomous AI agents on **Robinhood Chain**.

---

## 1. What Contributions Are Wanted Right Now

We are actively seeking contributions in the following targeted areas:
- **Proof-of-Life Optimization:** Benchmarking and optimizing browser Web Worker Keccak-256 throughput and memory footprint across mobile browsers.
- **Agent Fleet Adapters:** Real-time telemetry ingestion pipelines connecting autonomous agent feeds (X API, on-chain activities) into the agent state machine.
- **Robinhood Chain Integration:** Robust EVM provider configurations, EIP-712 signing flows, and transaction confirmation listeners for Robinhood Chain L2.
- **Test Coverage:** Additional unit and integration tests for epoch distribution edge cases, multiplier calculations, and decay formulas in `/backend`.

### What Is Out of Scope (For Now)
- Custom Solidity smart contracts for the core game loop (all game state and compute verification are deliberately managed off-chain for zero gas and rapid iteration).
- Non-Robinhood Chain integrations or alt-L1 chains.
- Speculative token price or APY marketing widgets.

---

## 2. Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/notadeveloper7/monkiilabs.git
   cd monkiilabs
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   bun install
   bun run check
   bun test
   ```

3. **Frontend Setup:**
   ```bash
   # From root
   cp .env.example .env
   bun install
   bun run check
   bun run dev
   ```

---

## 3. Contribution Workflow

1. **Create an issue:** For any significant architectural change or new feature, open an issue first to discuss alignment with the roadmap.
2. **Branch naming:** Use descriptive branch names:
   - `feat/webworker-multithread`
   - `fix/epoch-multiplier-rounding`
   - `docs/api-specification`
3. **Keep PRs focused:** Submit one concern per pull request. Do not bundle unrelated refactors with bug fixes.
4. **Testing requirement:** Ensure all tests pass before submitting (`bun test` in `/backend` and `bun run check` in both root and `/backend`). Add test cases for any new route or logic.

---

## 4. Commit Message Guidelines

Use imperative, present-tense, plain-English commit messages without co-author trailers:

- `add keccak256 proof-of-work difficulty scaling`
- `fix user reward snapshot rounding in epoch disbursal`
- `update companion equipment slot validation in backend`
- `scaffold initial Robinhood Chain repository structure`

---

## 5. Bug Reporting Format

When opening a bug report, use this format:

```markdown
### What you did
Describe the steps taken (e.g., started Proof-of-Life session for agent 'monkii-prime' at standard intensity).

### What you got
The actual response or behavior observed (e.g., 500 internal server error with message 'nonce mismatch').

### What you expected
The expected behavior (e.g., 200 OK with next challenge seed and updated power).

### Reproduction steps
1. POST /api/sessions/start with agentId: "monkii-prime"
2. Solve nonced hash with difficulty 8
3. POST /api/sessions/heartbeat with generated nonce
```

---

## 6. Security Vulnerabilities

Please **do not** report security vulnerabilities via public GitHub issues. Refer to [SECURITY.md](SECURITY.md) for instructions on disclosing security concerns directly to our team.
