import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { createMaster, loadMaster } from "./wallet/master.js";
import { deriveWallet } from "./wallet/derive.js";
import { add, getAll } from "./wallet/metadata.js";

console.log("🔗 BMC1-Quantum-Wallet - Quantum-Safe Wallet");
console.log("============================================================");

async function main() {
  // Ask user for a password
  const { password } = await inquirer.prompt({
    type: "password",
    name: "password",
    message: "Enter a master password:",
    mask: "*"
  });

  // Check if a master key already exists
  const masterFiles = fs.existsSync(path.join("storage", "master-keys"))
    ? fs.readdirSync(path.join("storage", "master-keys"))
    : [];

  let masterFile;
  if (masterFiles.length === 0) {
    // Create new master key
    masterFile = await createMaster(password);
    console.log("✅ New master key created.");
  } else {
    // Load the first existing master key (for simplicity)
    masterFile = path.join("storage", "master-keys", masterFiles[0]);
    console.log(`🔑 Loading existing master key: ${masterFile}`);
  }

  // Decrypt master key
  const master = loadMaster(masterFile, password);

  // Ask how many wallets to create
  const { count } = await inquirer.prompt({
    type: "number",
    name: "count",
    message: "How many wallets to create?",
    default: 1,
    validate: input => Number.isInteger(input) && input > 0 ? true : 'Must be integer > 0'
  });

  // Determine last wallet index
  const metadata = getAll();
  const lastIndex = Object.keys(metadata).length
    ? Math.max(...Object.keys(metadata)) + 1
    : 0;

  // Derive wallets
  for (let i = 0; i < count; i++) {
    const wallet = deriveWallet(master.privateKey, lastIndex + i, password);
    add(wallet);
    console.log(`💡 Wallet #${lastIndex + i} created: ${wallet.address}`);
  }

  console.log("✔ All done! Your wallets are stored in storage/wallets/");
}

main();
