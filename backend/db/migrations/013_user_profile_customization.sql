-- Migration 013: User Profile Customization
-- Adds customizable avatar, bio, and social handle to users

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS x_handle TEXT;

CREATE INDEX IF NOT EXISTS idx_users_x_handle ON users(x_handle);
