import { sha3_256 } from "@noble/hashes/sha3";

/**
 * Hash a public key to generate a wallet address
 * Uses SHA3-256 and truncates to 20 bytes
 * @param {Uint8Array|string} pubKey - SPHINCS public key
 * @returns {string} Hex string representing wallet address
 */
export function hashAddress(pubKey) {
  const bytes = typeof pubKey === "string" ? Buffer.from(pubKey, "hex") : pubKey;
  const hash = sha3_256(bytes);
  return Buffer.from(hash).slice(0, 20).toString("hex"); // 20-byte address
}
