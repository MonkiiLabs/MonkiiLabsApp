import { randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { getAddress, verifyMessage } from "viem";
import type { NextFunction, Request, Response } from "express";

import { env } from "./env";
import { pool } from "../db/index";

const secret = new TextEncoder().encode(env.jwtSecret);

export interface SessionUser {
  id: string;
  walletAddress: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

/** Normalise to checksummed EVM / Robinhood Chain address. */
export function normalizeAddress(address: string): string {
  try {
    return getAddress(address.trim());
  } catch {
    throw new Error("invalid_evm_address");
  }
}

/** Human-readable message the user signs with Robinhood Wallet / EVM wallet. */
export function buildSignInMessage(address: string, nonce: string): string {
  return [
    "Monkii Labs wants you to sign in with your Robinhood Chain wallet.",
    "",
    `Address: ${address}`,
    `Nonce: ${nonce}`,
    "",
    "Signing proves wallet ownership. It costs no gas and triggers no transaction.",
  ].join("\n");
}

/** Issue and persist a time-bound, single-use nonce for a wallet. */
export async function issueNonce(address: string): Promise<{ nonce: string; message: string }> {
  const normalized = normalizeAddress(address);
  const nonce = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + env.nonceTtlSeconds * 1000);

  await pool.query(
    `INSERT INTO auth_nonces (wallet_address, nonce, expires_at) VALUES ($1, $2, $3)`,
    [normalized, nonce, expiresAt],
  );

  return { nonce, message: buildSignInMessage(normalized, nonce) };
}

/** Verify signature against active nonce, create/fetch user, initialize rewards. */
export async function verifySignature(
  rawAddress: string,
  signature: string,
): Promise<SessionUser> {
  const address = normalizeAddress(rawAddress);

  // 1. Fetch unexpired nonce for this address
  const { rows } = await pool.query<{ id: number; nonce: string }>(
    `SELECT id, nonce FROM auth_nonces
      WHERE wallet_address = $1 AND expires_at > now()
      ORDER BY created_at DESC LIMIT 1`,
    [address],
  );
  const nonceRow = rows[0];
  if (!nonceRow) throw new Error("nonce_missing_or_expired");

  // 2. Reconstruct message and verify cryptographic signature
  const message = buildSignInMessage(address, nonceRow.nonce);
  const isValid = await verifyMessage({
    address: address as `0x${string}`,
    message,
    signature: signature as `0x${string}`,
  });

  if (!isValid) throw new Error("invalid_signature");

  // Consume used nonce
  await pool.query(`DELETE FROM auth_nonces WHERE id = $1`, [nonceRow.id]);

  // 3. Upsert user record
  const userRes = await pool.query<{ id: string; wallet_address: string }>(
    `INSERT INTO users (wallet_address, address)
     VALUES ($1, $1)
     ON CONFLICT (wallet_address)
     DO UPDATE SET updated_at = now()
     RETURNING id, wallet_address`,
    [address],
  );
  const user = userRes.rows[0];

  // 4. Ensure initial rewards ledger exists
  await pool.query(
    `INSERT INTO rewards (user_id, user_address, reward_multiplier)
     VALUES ($1, $2, 1.0)
     ON CONFLICT (user_address) DO NOTHING`,
    [user.id, address],
  );

  return { id: user.id, walletAddress: user.wallet_address };
}

/** Issues a signed JWT for the verified session. */
export async function createSession(user: SessionUser): Promise<string> {
  return await new SignJWT({ address: user.walletAddress })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${env.sessionTtlSeconds}s`)
    .sign(secret);
}

/** Session authentication middleware. Attaches req.user if Bearer token is valid. */
export async function sessionMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    next();
    return;
  }
  const token = auth.slice(7).trim();
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.sub && typeof payload.address === "string") {
      req.user = {
        id: payload.sub,
        walletAddress: payload.address,
      };
    }
  } catch {}
  next();
}

/** Route guard requiring active session authentication. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}
