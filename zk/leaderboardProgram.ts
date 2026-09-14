import { Field, MerkleWitness, Poseidon, Struct, ZkProgram } from "o1js";

/* =====================================================================
   Private Standing: the circuit.

   This file is the single source of truth for both sides. The prover in
   the browser and the verifier on the server must compile byte-identical
   circuits, because the verification key is derived from the circuit and
   a one-character difference makes every proof fail to verify. So it
   lives outside both src trees and each imports it, rather than being
   copied into each.

   WHAT IS PROVED

   "I hold a place in the published standing for this epoch that is at
   least as good as rank N, and my stake is at least K", while revealing
   neither which place nor which wallet.

   HOW IT HOLDS UP

   A proof on its own proves nothing here. Without a commitment to what
   the standing actually is, a prover simply asserts a tree in which they
   are first. So the server publishes a Merkle root over the ranked list
   each epoch, and the root is a public input: the proof is only
   meaningful relative to a root the verifier already published.

   Ownership is the second half. The leaderboard is public, so knowing a
   leaf is not evidence of owning it. Each participant registers
   Poseidon(secret) once, and that commitment goes into their leaf. The
   circuit requires the prover to supply the secret itself, so only the
   holder can produce a proof for their own leaf.

   The secret is derived from a wallet signature over a fixed message, so
   it is recoverable on any device and never stored by us.

   WHAT IT DELIBERATELY DOES NOT HIDE

   The root, the rank threshold and the stake threshold are public, by
   construction: the verifier has to know which claim it is accepting.
   So a proof reveals "somebody in this epoch's top 10 with at least 1000
   staked", never who. Anonymity is therefore bounded by the size of that
   set. Proving "top 1" identifies you exactly, which is why the tier
   thresholds the product offers are coarse.
   ===================================================================== */

/** Depth 12 holds 4,096 ranked places. Every level costs a Poseidon hash
 * inside the circuit and therefore browser proving time, so this is sized
 * to the standing we actually publish rather than to a round number. */
export const STANDING_TREE_HEIGHT = 13;

export class StandingMerkleWitness extends MerkleWitness(STANDING_TREE_HEIGHT) {}

/**
 * A leaf is Poseidon(commitment, rank, stake).
 *
 * Rank is 1-based, so the comparison below is "rank <= maxRank" and rank
 * 0 is not a valid place. Stake is a whole number of $MONKI; fractions are
 * floored when the tree is built, so a threshold proof is conservative
 * rather than generous.
 */
export function standingLeaf(commitment: Field, rank: Field, stake: Field): Field {
  return Poseidon.hash([commitment, rank, stake]);
}

/** Identity commitment published once per participant. */
export function identityCommitment(secret: Field): Field {
  return Poseidon.hash([secret]);
}

/**
 * Spent-proof marker, unique per secret per root and unlinkable to the
 * wallet. It lets the server refuse the same standing being redeemed for
 * one perk twice, without learning whose standing it is.
 */
export function standingNullifier(secret: Field, root: Field): Field {
  return Poseidon.hash([secret, root, Field(1)]);
}

/** Everything the verifier is told. The claim, and nothing else. */
export class StandingClaim extends Struct({
  /** Merkle root of the ranked standing, published by the server. */
  root: Field,
  /** Claimed placing: the prover is at rank <= this. */
  maxRank: Field,
  /** Claimed stake floor: the prover's stake is >= this. */
  minStake: Field,
}) {}

export const PrivateStanding = ZkProgram({
  name: "monkii-private-standing",
  publicInput: StandingClaim,
  publicOutput: Field, // the nullifier

  methods: {
    proveStanding: {
      privateInputs: [Field, Field, Field, StandingMerkleWitness],

      /**
       * @param claim     public: root, rank ceiling, stake floor
       * @param secret    private: preimage of the registered commitment
       * @param rank      private: the prover's actual 1-based place
       * @param stake     private: the prover's actual staked whole $MONKI
       * @param witness   private: Merkle path from the leaf to the root
       */
      async method(
        claim: StandingClaim,
        secret: Field,
        rank: Field,
        stake: Field,
        witness: StandingMerkleWitness,
      ) {
        // 1. Only the holder of the secret can speak for this leaf.
        const commitment = identityCommitment(secret);

        // 2. That leaf really is in the standing the server published.
        //    calculateRoot is the whole of the membership argument: it
        //    recomputes the root from the leaf upward, so a leaf that is
        //    not in the tree cannot produce a matching root.
        const leaf = standingLeaf(commitment, rank, stake);
        witness.calculateRoot(leaf).assertEquals(claim.root, "leaf is not in the published standing");

        // 3. The claim is at least as strong as the truth.
        //    assertLessThanOrEqual is a range-checked comparison, so a
        //    prover cannot wrap around the field to fake a low rank.
        rank.assertLessThanOrEqual(claim.maxRank, "rank does not meet the claimed placing");
        claim.minStake.assertLessThanOrEqual(stake, "stake does not meet the claimed floor");

        // 4. Rank is 1-based; rank 0 would otherwise satisfy any ceiling.
        rank.assertNotEquals(Field(0), "rank must be a real placing");

        return { publicOutput: standingNullifier(secret, claim.root) };
      },
    },
  },
});

export class PrivateStandingProof extends ZkProgram.Proof(PrivateStanding) {}
