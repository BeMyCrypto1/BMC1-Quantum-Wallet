import fs from "fs-extra";
import path from "path";
import { encrypt, decrypt } from "../crypto/aes.js";
import { generateKeyPair } from "../crypto/sphincs.js";

const DIR = path.join("storage", "master-keys");

/**
 * Create a new master key (SPHINCS) and encrypt it with the user's password
 * @param {string} password - User password
 * @returns {string} File path of the encrypted master key
 */
export async function createMaster(password) {
  fs.ensureDirSync(DIR); // Make sure the directory exists
  const keypair = generateKeyPair(); // Quantum-resistant SPHINCS key pair
  const encrypted = encrypt(keypair, password);

  const file = path.join(DIR, `master_${Date.now()}.enc`);
  fs.writeFileSync(file, encrypted);
  return file;
}

/**
 * Load and decrypt an existing master key
 * @param {string} file - Path to master key file
 * @param {string} password - User password
 * @returns {Object} Decrypted SPHINCS key pair {publicKey, privateKey}
 */
export function loadMaster(file, password) {
  return decrypt(fs.readFileSync(file, "utf8"), password);
}
