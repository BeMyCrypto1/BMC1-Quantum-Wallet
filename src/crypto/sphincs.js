import { SPHINCS } from "spx-hash-based";

/**
 * Generate a SPHINCS key pair
 * @param {Uint8Array|null} seed - Optional deterministic seed
 * @returns {Object} { publicKey, privateKey }
 */
export function generateKeyPair(seed = null) {
  return seed ? SPHINCS.generateKeyPair(seed) : SPHINCS.generateKeyPair();
}
