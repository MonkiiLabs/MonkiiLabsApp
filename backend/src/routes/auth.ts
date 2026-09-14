import { Router } from "express";
import { z } from "zod";

import { pool } from "../db/index";
import { createSession, issueNonce, verifySignature } from "../lib/auth";
import { handler, parseBody } from "../lib/http";

export const authRouter = Router();

const nonceSchema = z.object({ walletAddress: z.string() });
const verifySchema = z.object({
  walletAddress: z.string(),
  signature: z.string(),
});

// POST /api/auth/nonce — issue signing challenge for Robinhood / EVM wallet
authRouter.post(
  "/auth/nonce",
  handler(async (req, res) => {
    const body = parseBody(nonceSchema, req, res);
    if (!body) return;
    try {
      const { nonce, message } = await issueNonce(body.walletAddress);
      res.json({ nonce, message });
    } catch {
      res.status(400).json({ error: "invalid_address" });
    }
  }),
);

// POST /api/auth/verify — verify signed message, return JWT session token
authRouter.post(
  "/auth/verify",
  handler(async (req, res) => {
    const body = parseBody(verifySchema, req, res);
    if (!body) return;
    try {
      const user = await verifySignature(body.walletAddress, body.signature);
      const token = await createSession(user);
      res.json({ token, user });
    } catch (err: any) {
      res.status(401).json({ error: err.message || "unauthorized" });
    }
  }),
);

// GET /api/auth/me — profile & aggregate stats of authenticated user
authRouter.get(
  "/auth/me",
  handler(async (req, res) => {
    if (!req.user) {
      res.json({ user: null });
      return;
    }

    const { rows } = await pool.query<{
      id: string;
      wallet_address: string;
      display_name: string | null;
      avatar_url: string | null;
      bio: string | null;
      x_handle: string | null;
      total_monki_earned: string;
      power_rank: number | null;
      telegram_username: string | null;
      telegram_link_code: string | null;
      telegram_chat_id: string | null;
      created_at: Date;
    }>(
      `SELECT id, wallet_address, display_name, avatar_url, bio, x_handle,
              total_monki_earned,
              (
                SELECT COUNT(*) + 1 FROM users
                 WHERE total_monki_earned > (SELECT COALESCE(total_monki_earned, 0) FROM users WHERE wallet_address = $1)
              ) AS power_rank,
              telegram_username, telegram_link_code, telegram_chat_id, created_at
         FROM users WHERE wallet_address = $1`,
      [req.user.walletAddress],
    );

    const u = rows[0];
    if (!u) {
      res.json({ user: null });
      return;
    }

    res.json({
      user: {
        id: u.id,
        walletAddress: u.wallet_address,
        displayName: u.display_name,
        avatarUrl: u.avatar_url,
        bio: u.bio,
        xHandle: u.x_handle,
        totalMonkiEarned: Number(u.total_monki_earned),
        powerRank: u.power_rank ? Number(u.power_rank) : 1,
        telegram: {
          linked: Boolean(u.telegram_chat_id),
          username: u.telegram_username,
          linkCode: u.telegram_link_code,
        },
        createdAt: new Date(u.created_at).toISOString(),
      },
    });
  }),
);

const updateProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(32).nullable().optional(),
  avatarUrl: z.string().trim().max(500).nullable().optional(),
  bio: z.string().trim().max(280).nullable().optional(),
  xHandle: z
    .string()
    .trim()
    .max(32)
    .transform((val) => (val ? val.replace(/^@+/, "") : null))
    .nullable()
    .optional(),
});

// PATCH /api/auth/profile — update profile customization (display name, avatar, bio, x handle)
const handleUpdateProfile = handler(async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const body = parseBody(updateProfileSchema, req, res);
  if (!body) return;

  const updates: string[] = ["updated_at = NOW()"];
  const values: any[] = [];
  let idx = 1;

  if (body.displayName !== undefined) {
    updates.push(`display_name = $${idx++}`);
    values.push(body.displayName || null);
  }
  if (body.avatarUrl !== undefined) {
    updates.push(`avatar_url = $${idx++}`);
    values.push(body.avatarUrl || null);
  }
  if (body.bio !== undefined) {
    updates.push(`bio = $${idx++}`);
    values.push(body.bio || null);
  }
  if (body.xHandle !== undefined) {
    updates.push(`x_handle = $${idx++}`);
    values.push(body.xHandle || null);
  }

  values.push(req.user.walletAddress);

  const { rows } = await pool.query<{
    id: string;
    wallet_address: string;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    x_handle: string | null;
    total_monki_earned: string;
    power_rank: number | null;
    telegram_username: string | null;
    telegram_link_code: string | null;
    telegram_chat_id: string | null;
    created_at: Date;
  }>(
    `UPDATE users
        SET ${updates.join(", ")}
      WHERE wallet_address = $${idx}
      RETURNING id, wallet_address, display_name, avatar_url, bio, x_handle,
                total_monki_earned,
                (
                  SELECT COUNT(*) + 1 FROM users
                   WHERE total_monki_earned > (SELECT COALESCE(total_monki_earned, 0) FROM users WHERE wallet_address = $${idx})
                ) AS power_rank,
                telegram_username, telegram_link_code, telegram_chat_id, created_at`,
    values,
  );

  const u = rows[0];
  if (!u) {
    res.status(404).json({ error: "user_not_found" });
    return;
  }

  res.json({
    ok: true,
    user: {
      id: u.id,
      walletAddress: u.wallet_address,
      displayName: u.display_name,
      avatarUrl: u.avatar_url,
      bio: u.bio,
      xHandle: u.x_handle,
      totalMonkiEarned: Number(u.total_monki_earned),
      powerRank: u.power_rank ? Number(u.power_rank) : 1,
      telegram: {
        linked: Boolean(u.telegram_chat_id),
        username: u.telegram_username,
        linkCode: u.telegram_link_code,
      },
      createdAt: new Date(u.created_at).toISOString(),
    },
  });
});

authRouter.patch("/auth/profile", handleUpdateProfile);
authRouter.post("/auth/profile", handleUpdateProfile);

