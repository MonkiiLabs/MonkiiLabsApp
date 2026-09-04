/// <reference lib="webworker" />
import { keccak256 } from "viem";

// `self` is typed as Window in a DOM-lib project; narrow it once here.
const ctx = self as unknown as DedicatedWorkerGlobalScope;

/**
 * Proof-of-Life solver.
 *
 * Grinds a nonce until keccak256(`${seed}:${nonce}`) carries at least
 * `difficulty` leading zero bits. It runs off the main thread so a heartbeat
 * session never blocks the interface, and it reports progress so the cockpit
 * can show that real work is happening rather than a fake spinner.
 */

const encoder = new TextEncoder();

function countLeadingZeroBits(hex: string): number {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  let bits = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === "0") {
      bits += 4;
      continue;
    }
    if (char === "1") bits += 3;
    else if (char === "2" || char === "3") bits += 2;
    else if (char >= "4" && char <= "7") bits += 1;
    break;
  }
  return bits;
}

export interface PowRequest {
  seed: string;
  difficulty: number;
  /** Cancels an in-flight grind so a stopped session doesn't keep burning CPU. */
  cancel?: boolean;
}

export type PowResponse =
  | { type: "solved"; seed: string; nonce: string; hash: string; hashes: number; ms: number }
  | { type: "progress"; seed: string; hashes: number; hashRate: number }
  | { type: "cancelled"; seed: string };

let cancelledSeed: string | null = null;

ctx.onmessage = (event: MessageEvent<PowRequest>) => {
  const { seed, difficulty, cancel } = event.data;

  if (cancel) {
    cancelledSeed = seed;
    ctx.postMessage({ type: "cancelled", seed } as PowResponse);
    return;
  }

  cancelledSeed = null;
  const startedAt = Date.now();
  let nonce = 0;

  // Progress is reported on a fixed stride so the message channel never
  // becomes the bottleneck on a fast machine.
  const REPORT_EVERY = 20_000;

  for (;;) {
    if (cancelledSeed === seed) return;

    const nonceStr = nonce.toString(16);
    const hash = keccak256(encoder.encode(`${seed}:${nonceStr}`));

    if (countLeadingZeroBits(hash) >= difficulty) {
      ctx.postMessage({
        type: "solved",
        seed,
        nonce: nonceStr,
        hash,
        hashes: nonce + 1,
        ms: Date.now() - startedAt,
      } as PowResponse);
      return;
    }

    nonce++;

    if (nonce % REPORT_EVERY === 0) {
      const elapsed = Math.max(1, Date.now() - startedAt);
      ctx.postMessage({
        type: "progress",
        seed,
        hashes: nonce,
        hashRate: Math.round((nonce / elapsed) * 1000),
      } as PowResponse);
    }
  }
};
