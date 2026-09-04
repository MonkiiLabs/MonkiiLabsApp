import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createWalletClient, createPublicClient, http, defineChain, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const artifactPath = path.resolve(__dirname, "artifacts", "MonkiiCompanions.json");
if (!fs.existsSync(artifactPath)) {
  console.error("Artifact not found! Run 'bun run compile.ts' first.");
  process.exit(1);
}
const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
if (!privateKey) {
  console.error("DEPLOYER_PRIVATE_KEY missing in contracts/.env");
  process.exit(1);
}

const rpcUrl = process.env.ROBINHOOD_CHAIN_RPC_URL || "https://rpc.mainnet.chain.robinhood.com";
const chainId = Number(process.env.ROBINHOOD_CHAIN_ID || 4663);

const robinhoodChain = defineChain({
  id: chainId,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [rpcUrl] } },
});

const account = privateKeyToAccount(privateKey);
console.log(`Deployer Address: ${account.address}`);

const publicClient = createPublicClient({
  chain: robinhoodChain,
  transport: http(rpcUrl),
});

const walletClient = createWalletClient({
  account,
  chain: robinhoodChain,
  transport: http(rpcUrl),
});

async function main() {
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`Deployer Balance: ${formatEther(balance)} ETH`);

  if (balance === 0n) {
    console.error("Deployer balance is 0 ETH! Please fund this address on Robinhood Chain.");
    process.exit(1);
  }

  console.log("Broadcasting deployment transaction to Robinhood Chain...");
  const hash = await walletClient.deployContract({
    abi,
    bytecode,
    args: [],
  });
  console.log(`Tx Hash: ${hash}`);

  console.log("Waiting for block confirmation on Robinhood Chain...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress;

  console.log("==================================================");
  console.log("🎉 MonkiiCompanions ERC-721 Deployed Successfully!");
  console.log(`Contract Address: ${contractAddress}`);
  console.log(`Block Number: ${receipt.blockNumber}`);
  console.log(`Gas Used: ${receipt.gasUsed.toString()}`);
  console.log("==================================================");

  fs.writeFileSync(
    path.resolve(__dirname, "deployed_address.json"),
    JSON.stringify(
      {
        network: "Robinhood Chain",
        chainId,
        contractAddress,
        deployerAddress: account.address,
        txHash: hash,
        blockNumber: receipt.blockNumber.toString(),
        deployedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
