import { pool } from "./index";
import { env } from "../lib/env";
import { PONS_EPOCH_ANCHOR, PONS_EPOCH_MS, epochIndexAt, firstEligibleEpochIndex } from "../lib/pons-epoch";

/**
 * Accrues any completed 24-hour $PONS epochs for a user.
 * Row-locked (FOR UPDATE) to prevent race conditions and double-spending.
 */
export async function accrueStakingRewards(userAddress: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query<{
      staked_monki: string;
      stake_period_started_at: Date;
      pons_paid_through: Date;
    }>(
      `SELECT staked_monki, stake_period_started_at, pons_paid_through
         FROM rewards WHERE user_address = $1 FOR UPDATE`,
      [userAddress],
    );
    const row = rows[0];
    if (!row) {
      await client.query("ROLLBACK");
      return;
    }

    const staked = Number(row.staked_monki ?? 0);
    const now = new Date();
    const nowEpochIdx = epochIndexAt(now);
    const eligibleFromIdx = Math.max(
      firstEligibleEpochIndex(new Date(row.stake_period_started_at)),
      epochIndexAt(new Date(row.pons_paid_through)),
    );
    const completedEpochs = Math.max(nowEpochIdx - eligibleFromIdx, 0);

    if (completedEpochs > 0 && staked >= env.ponsMinStakeForPons) {
      const reward = completedEpochs * staked * env.ponsRewardPerMonki;
      const paidThrough = new Date(
        PONS_EPOCH_ANCHOR.getTime() + (eligibleFromIdx + completedEpochs) * PONS_EPOCH_MS,
      );

      await client.query(
        `UPDATE rewards
            SET claimable_pons = claimable_pons + $1,
                pons_paid_through = $2,
                updated_at = now()
          WHERE user_address = $3`,
        [reward, paidThrough, userAddress],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
