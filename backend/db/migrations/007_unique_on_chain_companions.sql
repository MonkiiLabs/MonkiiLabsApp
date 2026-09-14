-- Prevent repeated inventory reads from registering the same ERC-721 token twice.
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_companions_user_on_chain_mint
  ON user_companions (user_address, on_chain_mint)
  WHERE on_chain_mint IS NOT NULL;
