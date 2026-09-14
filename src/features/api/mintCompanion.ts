import { getAccount, sendTransaction, switchChain } from "wagmi/actions";

import { wagmiConfig } from "@/lib/wagmi";
import { CHAIN_ID, CHAIN_NAME } from "@/lib/config";
import { companions } from "./endpoints";

/**
 * Resolves once wagmi has finished restoring the previous session.
 *
 * On a hard load wagmi rehydrates the stored connection before the connector
 * itself is ready, so `getAccount` reports an address while
 * `config.state.status` is still "reconnecting". Any action that needs the
 * provider then throws ConnectorUnavailableReconnectingError, which is the
 * `Connector "..." unavailable while reconnecting.` failure seen on mint.
 * wagmi names the cause in its own error detail: connectors that inject
 * asynchronously after reconnection has already begun, which is exactly how
 * an in-app wallet browser behaves.
 *
 * The timeout is a floor, not a guarantee. If reconnection never settles the
 * mint proceeds and fails with a real wallet error rather than hanging.
 */
function waitForConnectorReady(timeoutMs = 10_000): Promise<void> {
  const settled = (status: string) => status !== "reconnecting" && status !== "connecting";
  if (settled(wagmiConfig.state.status)) return Promise.resolve();

  return new Promise<void>((resolve) => {
    let unsubscribe: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      if (timer) clearTimeout(timer);
      unsubscribe?.();
      resolve();
    };

    timer = setTimeout(finish, timeoutMs);
    unsubscribe = wagmiConfig.subscribe(
      (state) => state.status,
      (status) => {
        if (settled(status)) finish();
      },
    );

    // The status can settle between the check above and the subscription.
    if (settled(wagmiConfig.state.status)) finish();
  });
}

/**
 * Two-step companion mint.
 *
 * The backend builds the calldata so the client carries no ABI, no contract
 * address and no chain assumptions. The wallet signs and broadcasts (paying
 * only native ETH gas: the mint itself is free), then the backend watches
 * the transaction and registers the token in the user's inventory.
 *
 * Everything goes through the wagmi connector rather than `window.ethereum`.
 * The injected provider only exists for browser extensions, so the previous
 * implementation could not mint from a WalletConnect session or from a
 * mobile wallet's in-app browser, which is where the PRD expects most
 * Robinhood Wallet traffic to arrive from.
 */
export async function mintCompanion(
  companionId: string,
  onStage?: (stage: "building" | "signing" | "verifying") => void,
): Promise<{ txHash: string }> {
  // Read the account only after reconnection settles: before that the address
  // comes from the restored snapshot and the connector behind it is not usable.
  await waitForConnectorReady();

  const { address, chainId, connector } = getAccount(wagmiConfig);
  if (!address || !connector) throw new Error("Connect a wallet to mint.");

  // 1: ask the backend for the transaction payload.
  onStage?.("building");
  const tx = await companions.buildMintTx(companionId);

  // The payload names the chain it must land on, so make sure the wallet
  // agrees before asking for a signature: otherwise the mint silently
  // broadcasts to the wrong network.
  if (chainId !== CHAIN_ID) {
    try {
      await switchChain(wagmiConfig, { chainId: CHAIN_ID });
    } catch {
      throw new Error(`Switch your wallet to ${CHAIN_NAME} to mint.`);
    }
  }

  // 2: user signs and broadcasts.
  onStage?.("signing");
  const txHash = await sendTransaction(wagmiConfig, {
    account: address,
    chainId: CHAIN_ID,
    to: tx.to as `0x${string}`,
    data: tx.data as `0x${string}`,
    value: BigInt(tx.value ?? "0x0"),
  });

  // 3: backend confirms the receipt and writes the inventory row.
  onStage?.("verifying");
  await companions.verifyMint(txHash, companionId);

  return { txHash };
}
