// scripts/deployStorageHash.js
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { ethers } = require("ethers");
const { LacchainProvider, LacchainSigner } = require("@lacchain/gas-model-provider");

dotenv.config();

// Variables desde .env
const RPC = process.env.RPC || "http://127.0.0.1:4545";
const NODE_ADDRESS = process.env.NODE_ADDRESS || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const EXPIRATION_MS = parseInt(process.env.EXPIRATION_MS || "300000", 10);

if (!NODE_ADDRESS || !PRIVATE_KEY) {
  console.error("ERROR: NODE_ADDRESS o PRIVATE_KEY no definidos en .env");
  process.exit(1);
}

async function main() {
  console.log("RPC:", RPC);
  console.log("NODE_ADDRESS:", NODE_ADDRESS);
  console.log("Usando LacchainProvider y LacchainSigner...");

  // provider y signer según doc
  const provider = new LacchainProvider(RPC);
  const expirationDate = Date.now() + EXPIRATION_MS;
  const signer = new LacchainSigner(PRIVATE_KEY, provider, NODE_ADDRESS, expirationDate);

  // Carga artifact compilado por Hardhat
  const artifactPath = path.join(process.cwd(), "artifacts", "contracts", "StorageHash.sol", "StorageHash.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("Artifact not found:", artifactPath);
    process.exit(1);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

  console.log("Deploying StorageHash contract...");

  // Para ethers v6, deploy y espera confirmación
  const contract = await factory.deploy();
  await contract.waitForDeployment(); // Espera a que el contrato esté en la blockchain

  const contractAddress = await contract.getAddress();
  console.log("Contract deployed at:", contractAddress);

  // Guarda la dirección en .env.local para usar en storeHash.js
  const envPath = path.join(process.cwd(), ".env.local");
  fs.appendFileSync(envPath, `\nCONTRACT_ADDRESS=${contractAddress}\n`);
  console.log(`Contract address saved to ${envPath}`);

  console.log("Done.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
