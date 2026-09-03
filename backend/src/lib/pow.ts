import { randomBytes } from "node:crypto";
import { keccak256 } from "viem";

import { env } from "./env";
import { pool } from "../db/index";

export interface Challenge {
  seed: string;
  difficulty: number;
  expiresAt: string;
}

const encoder = new TextEncoder();

/** Count leading zero bits of a 32-byte keccak digest (0x-prefixed hex). */
export function leadingZeroBits(hexDigest: string): number {
  const hex = hexDigest.startsWith("0x") ? hexDigest.slice(2) : hexDigest;
  let bits = 0;
  for (let i = 0; i < hex.length; i++) {
    const char = hex[i];
    if (char === "0") {
      bits += 4;
    } else {
      if (char === "1") bits += 3;
      else if (char === "2" || char === "3") bits += 2;
      else if (char >= "4" && char <= "7") bits += 1;
      break;
    }
  }
  return bits;
}

/** Hash a challenge solution. Kept identical on client and server. */
export function hashSolution(seed: string, nonce: string): string {
  return keccak256(encoder.encode(`${seed}:${nonce}`));
}

/** Issue and persist a fresh single-use challenge for a session at the given difficulty. */
export async function issueChallenge(
  sessionId: number | string,
  difficulty: number = env.powDifficulty,
): Promise<Challenge> {
  const seed = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + env.powChallengeTtlSeconds * 1000);

  await pool.query(
    `INSERT INTO pow_challenges (session_id, seed, difficulty, expires_at) VALUES ($1, $2, $3, $4)`,
    [sessionId, seed, difficulty, expiresAt],
  );

  return { seed, difficulty, expiresAt: expiresAt.toISOString() };
}

export type VerifyResult = { ok: true; difficulty: number } | { ok: false; reason: string };

/**
 * Verify a solution against an outstanding challenge for this session, then
 * consume the challenge (anti-replay).
 */
export async function verifyAndConsume(
  sessionId: number | string,
  seed: string,
  nonce: string,
): Promise<VerifyResult> {
  const { rows } = await pool.query<{ id: number; difficulty: number }>(
    `SELECT id, difficulty FROM pow_challenges
      WHERE session_id = $1 AND seed = $2 AND consumed = FALSE AND expires_at > now()`,
    [sessionId, seed],
  );
  const challenge = rows[0];
  if (!challenge) return { ok: false, reason: "challenge_missing_or_expired" };

  const digest = hashSolution(seed, nonce);
  if (leadingZeroBits(digest) < challenge.difficulty) {
    return { ok: false, reason: "insufficient_work" };
  }

  // Consume exactly once; concurrent submit loses race and is rejected
  const consumed = await pool.query(
    `UPDATE pow_challenges SET consumed = TRUE WHERE id = $1 AND consumed = FALSE`,
    [challenge.id],
  );
  if (consumed.rowCount === 0) return { ok: false, reason: "already_consumed" };

  return { ok: true, difficulty: challenge.difficulty };
}

/**
 * Power + $MONKI credited for an accepted heartbeat.
 */
export function computeAccrual(
  difficulty: number,
  rewardMultiplier: number,
): { powerDelta: number; monki: number } {
  let powerScale = 1.0;
  let monkiScale = 1.0;

  if (difficulty < env.powDifficulty) {
    // Light intensity
    powerScale = 0.5;
    monkiScale = 0.6;
  } else if (difficulty > env.powDifficulty) {
    // Max intensity
    powerScale = 1.5;
    monkiScale = 1.6;
  }

  return {
    powerDelta: Number((env.powBasePower * powerScale).toFixed(6)),
    monki: Number((env.powBaseMonki * monkiScale * rewardMultiplier).toFixed(6)),
  };
}

/** Brute-force helper for tests. */
export function solve(seed: string, difficulty: number, maxIters = 2_000_000): string | null {
  for (let i = 0; i < maxIters; i++) {
    const nonce = i.toString(16);
    if (leadingZeroBits(hashSolution(seed, nonce)) >= difficulty) return nonce;
  }
  return null;
}
