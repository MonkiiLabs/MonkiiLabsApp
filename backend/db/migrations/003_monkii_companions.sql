-- 003_monkii_companions.sql
-- Seed the new dedicated Monkii Labs Cyber-Primate Companion Roster

INSERT INTO companions (id, slug, name, description, category, rarity, image_url, earn_boost_pct, decay_reduction_pct, mint_price_pons, is_active)
VALUES
  ('cyber-chimp-drone', 'cyber-chimp-drone', 'Cyber-Chimp Drone', 'A high-frequency aerial reconnaissance micro-drone styled after a cybernetic chimp that optimizes Proof-of-Life heartbeat transmissions.', 'mech', 'Common', '/companions/cyber-chimp-drone.jpg', 6, 0, 50, TRUE),
  ('nano-baboon-core', 'nano-baboon-core', 'Nano-Baboon Core', 'A glowing magnetic containment sphere with a miniature cybernetic baboon matrix regulating hash throughput.', 'construct', 'Common', '/companions/nano-baboon-core.jpg', 8, 0, 80, TRUE),
  ('plasma-lemur', 'plasma-lemur', 'Plasma Lemur', 'An energetic, glowing neon plasma creature resembling a ring-tailed lemur with radiant turquoise fur that buffers agent power from thermal decay.', 'spirit', 'Uncommon', '/companions/plasma-lemur.jpg', 12, 10, 150, TRUE),
  ('mecha-mandrill', 'mecha-mandrill', 'Mecha Mandrill', 'An armored cybernetic mandrill with vibrant holographic facial plating, enhancing heartbeat resonance and defense.', 'guardian', 'Uncommon', '/companions/mecha-mandrill.jpg', 15, 15, 200, TRUE),
  ('quantum-ape-sentinel', 'quantum-ape-sentinel', 'Quantum Ape Sentinel', 'A monolithic titanium guardian with quantum computing coils that shields agents from ambient vitality entropy.', 'sentinel', 'Rare', '/companions/quantum-ape-sentinel.jpg', 20, 25, 350, TRUE),
  ('celestial-king-monkii', 'celestial-king-monkii', 'Celestial King Monkii', 'The radiant golden monarch of the Monkii constellation, wielding supreme computing cores and legendary neural synchronization.', 'celestial', 'Epic', '/companions/celestial-king-monkii.jpg', 30, 40, 750, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  rarity = EXCLUDED.rarity,
  image_url = EXCLUDED.image_url,
  earn_boost_pct = EXCLUDED.earn_boost_pct,
  decay_reduction_pct = EXCLUDED.decay_reduction_pct,
  mint_price_pons = EXCLUDED.mint_price_pons,
  is_active = TRUE;
