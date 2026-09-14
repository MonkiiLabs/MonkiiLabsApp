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
 *
 * NONCE SPACE. One worker alone walks 0, 1, 2, ... A worker in a pool is
 * handed an `offset` and a `stride` and walks offset, offset+stride, ...
 * so N workers cover the same space N ways without ever colliding and
 * without needing to talk to each other.
 *
 * YIELDING. The grind runs in slices rather than one blocking loop. A worker
 * that never returns to its event loop never receives a message, which is
 * why the old cancel path could not fire: by the time `onmessage` ran the
 * solution had already been posted. Slicing means a cancel lands within one
 * slice, which is what lets the first solver stop the other eleven.
 */

const encoder = new TextEncoder();

/** Nonces per slice. One slice is the worst-case latency of a cancel. */
const SLICE = 4_096;

/** Progress is throttled by wall clock so the channel is never the bottleneck. */
const REPORT_EVERY_MS = 250;

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
  /** First nonce this worker tries. Distinct per worker in a pool. */
  offset?: number;
  /** Gap between consecutive nonces. Equal to the pool size. */
  stride?: number;
  /** Cancels an in-flight grind so a stopped session doesn't keep burning CPU. */
  cancel?: boolean;
}

export type PowResponse =
  | { type: "solved"; seed: string; nonce: string; hash: string; hashes: number; ms: number }
  | { type: "progress"; seed: string; hashes: number; hashRate: number }
  | { type: "cancelled"; seed: string; hashes: number; ms: number };

interface Job {
  seed: string;
  difficulty: number;
  nonce: number;
  stride: number;
  hashes: number;
  startedAt: number;
  lastReportAt: number;
}

let job: Job | null = null;

/**
 * Slices are resumed through a MessagePort rather than setTimeout, which the
 * browser clamps to ~4ms once callbacks nest. At this slice size that clamp
 * would cost real hash rate; a port message is a task with no minimum delay.
 * A token guards against a stale slice resuming a job we have moved past.
 */
let runToken = 0;
const resume = new MessageChannel();
resume.port1.onmessage = (event: MessageEvent<number>) => {
  if (event.data === runToken) runSlice();
};

function schedule(): void {
  resume.port2.postMessage(runToken);
}

function runSlice(): void {
  if (!job) return;
  const { seed, difficulty, stride } = job;

  for (let i = 0; i < SLICE; i++) {
    const nonceStr = job.nonce.toString(16);
    const hash = keccak256(encoder.encode(`${seed}:${nonceStr}`));
    job.hashes++;

    if (countLeadingZeroBits(hash) >= difficulty) {
      ctx.postMessage({
        type: "solved",
        seed,
        nonce: nonceStr,
        hash,
        hashes: job.hashes,
        ms: Date.now() - job.startedAt,
      } satisfies PowResponse);
      job = null;
      runToken++;
      return;
    }

    job.nonce += stride;
  }

  const now = Date.now();
  if (now - job.lastReportAt >= REPORT_EVERY_MS) {
    job.lastReportAt = now;
    const elapsed = Math.max(1, now - job.startedAt);
    ctx.postMessage({
      type: "progress",
      seed,
      hashes: job.hashes,
      hashRate: Math.round((job.hashes / elapsed) * 1000),
    } satisfies PowResponse);
  }

  // Returning to the event loop here is what lets a cancel be delivered.
  schedule();
}

ctx.onmessage = (event: MessageEvent<PowRequest>) => {
  const { seed, difficulty, offset = 0, stride = 1, cancel } = event.data;

  if (cancel) {
    const stopped = job;
    job = null;
    runToken++;
    ctx.postMessage({
      type: "cancelled",
      seed: stopped?.seed ?? seed,
      hashes: stopped?.hashes ?? 0,
      ms: stopped ? Date.now() - stopped.startedAt : 0,
    } satisfies PowResponse);
    return;
  }

  const now = Date.now();
  runToken++;
  job = {
    seed,
    difficulty,
    nonce: Math.max(0, Math.floor(offset)),
    stride: Math.max(1, Math.floor(stride)),
    hashes: 0,
    startedAt: now,
    lastReportAt: now,
  };
  schedule();
};
