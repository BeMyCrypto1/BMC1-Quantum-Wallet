import CryptoJS from "crypto-js";
import { deriveKey } from "./kdf.js";

/**
 * Encrypt data with AES using a password (quantum-resistant)
 * @param {Object} data - JS object to encrypt
 * @param {string} password - User password
 * @returns {string} JSON string with salt + ciphertext
 */
export function encrypt(data, password) {
  const salt = CryptoJS.lib.WordArray.random(16); // random salt
  const key = deriveKey(password, salt);
  const cipher = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();

  return JSON.stringify({ salt: salt.toString(), cipher });
}

/**
 * Decrypt AES-encrypted data using a password
 * @param {string} payload - JSON string containing salt + cipher
 * @param {string} password - User password
 * @returns {Object} Decrypted JS object
 */
export function decrypt(payload, password) {
  const { salt, cipher } = JSON.parse(payload);
  const key = deriveKey(password, CryptoJS.enc.Hex.parse(salt));
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}
