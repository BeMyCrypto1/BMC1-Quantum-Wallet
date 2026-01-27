import fs from "fs-extra";
import path from "path";
import { sha3_512 } from "@noble/hashes/sha3";
import { generateKeyPair } from "../crypto/sphincs.js";
import { encrypt } from "../crypto/aes.js";
import { hashAddress } from "../crypto/hash.js";

const DIR = path.join("storage", "wallets");

/**
 * Derive a new wallet from the master private key
 * @param {string} masterPriv - Master private key (hex)
 * @param {number} index - Wallet index for deterministic derivation
 * @param {string} password - User password for encrypting the wallet
 * @returns {Object} Wallet metadata { index, address, file }
 */
export function deriveWallet(masterPriv, index, password) {
  fs.ensureDirSync(DIR);

  // Deterministic seed using SHA3-512
  const seed = sha3_512(
    Buffer.concat([Buffer.from(masterPriv, "hex"), Buffer.from([index])])
  );

  // Generate SPHINCS wallet keypair
  const wallet = generateKeyPair(seed);

  // Create address from public key
  const address = hashAddress(wallet.publicKey);

  // Encrypt wallet with password
  const encrypted = encrypt(wallet, password);
  const file = path.join(DIR, `wallet_${address}.enc`);
  fs.writeFileSync(file, encrypted);

  return { index, address, file };
}
