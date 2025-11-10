// scripts/storeHash.js
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const ethers = require("ethers");
const { LacchainProvider, LacchainSigner } = require("@lacchain/gas-model-provider");

dotenv.config();

const RPC = process.env.RPC || "http://127.0.0.1:4545";
const NODE_ADDRESS = process.env.NODE_ADDRESS || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const EXPIRATION_MS = parseInt(process.env.EXPIRATION_MS || "300000", 10);
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "";
const INPUT = process.env.INPUT || process.argv[2] || "mi-hash-de-prueba";

if (!NODE_ADDRESS) {
  console.error("ERROR: NODE_ADDRESS no definido en .env");
  process.exit(1);
}
if (!PRIVATE_KEY) {
  console.error("ERROR: PRIVATE_KEY no definido en .env");
  process.exit(1);
}
if (!CONTRACT_ADDRESS) {
  console.error("ERROR: CONTRACT_ADDRESS no definido en .env ni pasado como arg");
  process.exit(1);
}

async function main() {
  console.log("RPC:", RPC);
  console.log("Contract:", CONTRACT_ADDRESS);
  console.log("Input string:", INPUT);

  const provider = new LacchainProvider(RPC);
  const expirationDate = Date.now() + EXPIRATION_MS;
  const signer = new LacchainSigner(PRIVATE_KEY, provider, NODE_ADDRESS, expirationDate);

  const artifactPath = path.join(process.cwd(), "artifacts", "contracts", "StorageHash.sol", "StorageHash.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("Artifact not found:", artifactPath);
    process.exit(1);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer);

  // calcula bytes32 (keccak256) del string
  const hashBytes = ethers.keccak256(ethers.toUtf8Bytes(INPUT));
  console.log("Hash (bytes32):", hashBytes);

  const tx = await contract.storeHash(hashBytes);
  console.log("Tx sent:", tx.hash);
  const receipt = await tx.wait();
  console.log("Tx mined. Receipt:", receipt.transactionHash);

  let stored = false;
  try {
    stored = await contract.isStored(hashBytes); // función view
  } catch (e) {
    console.warn("No se pudo leer isStored:", e.message);
  }
  console.log("isStored:", stored);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});


