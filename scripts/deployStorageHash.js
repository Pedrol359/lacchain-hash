// scripts/deployStorageHash.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { ethers } from "ethers";
import { LacchainProvider, LacchainSigner } from "@lacchain/gas-model-provider";

dotenv.config();

// carga variables desde .env
const RPC = process.env.RPC || "http://127.0.0.1:4545";
const NODE_ADDRESS = process.env.NODE_ADDRESS || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const EXPIRATION_MS = parseInt(process.env.EXPIRATION_MS || "300000", 10);

if (!NODE_ADDRESS) {
  console.error("ERROR: NODE_ADDRESS no definido en .env");
  process.exit(1);
}
if (!PRIVATE_KEY) {
  console.error("ERROR: PRIVATE_KEY no definido en .env");
  process.exit(1);
}

async function main() {
  console.log("RPC:", RPC);
  console.log("NODE_ADDRESS:", NODE_ADDRESS);
  console.log("Usando LacchainProvider y LacchainSigner...");

  // provider y signer según la doc
  const provider = new LacchainProvider(RPC);
  const expirationDate = Date.now() + EXPIRATION_MS;
  const signer = new LacchainSigner(PRIVATE_KEY, provider, NODE_ADDRESS, expirationDate);

  // carga artifact (compilado por hardhat)
  const artifactPath = path.join(process.cwd(), "artifacts", "contracts", "StorageHash.sol", "StorageHash.json");
  if (!fs.existsSync(artifactPath)) {
    console.error("Artifact not found:", artifactPath);
    process.exit(1);
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

  console.log("Deploying StorageHash contract...");
  const contract = await factory.deploy();
  console.log("TxHash (deploy sent):", contract.deployTransaction.hash);

  const receipt = await contract.deployTransaction.wait();
  console.log("Contract deployed at:", receipt.contractAddress);
  console.log("Receipt:", receipt.transactionHash);
  console.log("Done.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
