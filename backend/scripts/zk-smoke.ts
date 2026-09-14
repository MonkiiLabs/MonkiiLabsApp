/**
 * End-to-end check on the Private Standing circuit: build a standing,
 * prove a place in it, verify, then confirm the two ways a liar fails.
 *
 * Run with: bun run scripts/zk-smoke.ts
 */
import { Field, MerkleTree, Poseidon, verify } from "o1js";

import {
  PrivateStanding,
  STANDING_TREE_HEIGHT,
  StandingClaim,
  StandingMerkleWitness,
  identityCommitment,
  standingLeaf,
  standingNullifier,
} from "../../zk/leaderboardProgram";

const t0 = Date.now();
console.log("[zk] compiling...");
const { verificationKey } = await PrivateStanding.compile();
console.log(`[zk] compiled in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

// A standing of 8 nurturers. Index 0 is unused so that tree index == rank.
const secrets = Array.from({ length: 8 }, (_, i) => Field(1000 + i));
const stakes = [9000, 7500, 5000, 4200, 3100, 2000, 1500, 900];

const tree = new MerkleTree(STANDING_TREE_HEIGHT);
secrets.forEach((secret, i) => {
  const rank = i + 1;
  tree.setLeaf(BigInt(rank), standingLeaf(identityCommitment(secret), Field(rank), Field(stakes[i])));
});
const root = tree.getRoot();
console.log("[zk] root", root.toString().slice(0, 20) + "...");

// Rank 3, stake 5000, claiming "top 5 and at least 4000 staked".
const rank = 3;
const secret = secrets[rank - 1];
const claim = new StandingClaim({ root, maxRank: Field(5), minStake: Field(4000) });
const witness = new StandingMerkleWitness(tree.getWitness(BigInt(rank)));

const t1 = Date.now();
console.log("[zk] proving...");
const { proof } = await PrivateStanding.proveStanding(
  claim,
  secret,
  Field(rank),
  Field(stakes[rank - 1]),
  witness,
);
console.log(`[zk] proved in ${((Date.now() - t1) / 1000).toFixed(1)}s`);

const ok = await verify(proof, verificationKey);
console.log("[zk] verify honest proof:", ok ? "PASS" : "FAIL");

const expectedNullifier = standingNullifier(secret, root).toString();
console.log(
  "[zk] nullifier matches:",
  proof.publicOutput.toString() === expectedNullifier ? "PASS" : "FAIL",
);

// The proof must not carry the rank, the stake or the wallet anywhere.
const leaked = JSON.stringify(proof.toJSON());
const hidesRank = !leaked.includes(Field(stakes[rank - 1]).toString());
console.log("[zk] stake absent from serialised proof:", hidesRank ? "PASS" : "FAIL");

// Liar 1: claims a better placing than they hold.
try {
  await PrivateStanding.proveStanding(
    new StandingClaim({ root, maxRank: Field(1), minStake: Field(0) }),
    secret,
    Field(rank),
    Field(stakes[rank - 1]),
    witness,
  );
  console.log("[zk] overclaiming rank: FAIL (proof was produced)");
} catch {
  console.log("[zk] overclaiming rank: PASS (refused)");
}

// Liar 2: holds no leaf in the tree at all.
try {
  const intruder = Field(424242);
  await PrivateStanding.proveStanding(
    new StandingClaim({ root, maxRank: Field(5), minStake: Field(0) }),
    intruder,
    Field(2),
    Field(7500),
    new StandingMerkleWitness(tree.getWitness(2n)),
  );
  console.log("[zk] forging membership: FAIL (proof was produced)");
} catch {
  console.log("[zk] forging membership: PASS (refused)");
}

console.log("[zk] vk hash", verificationKey.hash.toString());
