# Security Policy

At **Monkii Labs**, security and cryptographic integrity are paramount. We appreciate the responsible disclosure of any vulnerabilities found within our code, infrastructure, or cryptographic verification pipelines.

---

## 1. Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Send all vulnerability reports directly to:
**`security@monkiilabs.app`**

### What to include in your report:
- A clear description of the vulnerability and its potential impact.
- Step-by-step reproduction steps or a minimal proof of concept (PoC).
- Relevant environment details (browser, Node/Bun version, operating system).

---

## 2. Response Timelines

- **Acknowledgment:** We will acknowledge receipt of your report within **48 hours**.
- **Initial Assessment:** An initial severity triage and timeline assessment within **72 hours**.
- **Critical Patches:** Critical vulnerabilities affecting fund safety, reward claiming, or cryptographic proof integrity will be patched within **7 days**.
- **Public Disclosure:** Coordinated public disclosure after fixes have been deployed and verified.

---

## 3. Safe Harbor

Monkii Labs considers good-faith security research authorized. We commit to:
- Not pursuing legal action against researchers who report vulnerabilities following these guidelines.
- Working with you to understand and resolve the issue quickly.
- Acknowledging your contribution in our release notes (unless you prefer anonymity).

---

## 4. Project-Specific Attack Surfaces

When auditing Monkii Labs, key threat vectors include:

1. **Proof-of-Life Hash Forgery & Replay:**
   - Attempting to submit precomputed or duplicate nonces to `/api/sessions/heartbeat` without performing valid `keccak256` hashing work against the server-issued seed.
2. **Epoch Double-Claiming & Snapshot Race Conditions:**
   - Concurrent race conditions during the daily `00:00:00 UTC` staking disbursal window aimed at claiming $PONS or $META stock allocations more than once.
3. **Multiplier & Telemetry Manipulation:**
   - Tampering with client-side companion equip payloads or session parameters to artificially inflate the $MONKI staking multiplier.
4. **Authentication & Session Hijacking:**
   - Spoofing EIP-712 / Robinhood Connect challenge nonces to authenticate as unauthorized user addresses.
5. **Database Injection & Resource Exhaustion:**
   - Flooding heartbeat verification endpoints with malformed nonces to exhaust server CPU or PostgreSQL connection pool limits.

---

## 5. Deployed Contract Addresses

*No on-chain smart contracts are currently deployed in production. Contract addresses for Robinhood Chain testnet and mainnet deployments will be published here upon audit completion.*
