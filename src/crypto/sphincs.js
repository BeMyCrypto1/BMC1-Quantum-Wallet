import { SPHINCS } from "spx-hash-based";

/**
 * Generate a SPHINCS key pair
 * @param {Uint8Array|null} seed - Optional deterministic seed
 * @returns {Object} { publicKey, privateKey }
 * If a seed is provided, the wallet derivation will be deterministic, 
 *  so you can recreate wallets from a master key.
 * If seed is null, it generates a fully random SPHINCS key pair.
 */
export function generateKeyPair(seed = null) {
  return seed ? SPHINCS.generateKeyPair(seed) : SPHINCS.generateKeyPair();
}
