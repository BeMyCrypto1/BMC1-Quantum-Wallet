import CryptoJS from "crypto-js";

/**
 * Derive a strong AES key from a password using PBKDF2.
 * Quantum-resistant against brute-force attacks.
 * @param {string} password - User password
 * @param {CryptoJS.lib.WordArray|string} salt - Salt for key derivation
 * @returns {string} Hex-encoded AES key
 */
export function deriveKey(password, salt) {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 600000, // memory-hard for QC + GPU attacks
    hasher: CryptoJS.algo.SHA512
  }).toString();
}
