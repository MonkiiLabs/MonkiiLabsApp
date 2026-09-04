import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const sourcePath = path.resolve(__dirname, "MonkiiCompanions.sol");
const source = fs.readFileSync(sourcePath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "MonkiiCompanions.sol": {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    evmVersion: "paris",
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

console.log("Compiling MonkiiCompanions.sol...");
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasError = false;
  for (const err of output.errors) {
    console[err.severity === "error" ? "error" : "warn"](err.formattedMessage);
    if (err.severity === "error") hasError = true;
  }
  if (hasError) process.exit(1);
}

const contract = output.contracts["MonkiiCompanions.sol"]["MonkiiCompanions"];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

const artifactsDir = path.resolve(__dirname, "artifacts");
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

fs.writeFileSync(
  path.join(artifactsDir, "MonkiiCompanions.json"),
  JSON.stringify({ abi, bytecode: `0x${bytecode}` }, null, 2),
);

console.log("✅ Successfully compiled MonkiiCompanions.sol!");
console.log(`Bytecode size: ${bytecode.length / 2} bytes`);
