/**
 * When runing the original file of the sphics.js you may recibe error messages as:
   npm error code E404 
   npm error 404 Not Found - GET https://registry.npmjs.org/spx-hash-based - 
   Not found npm error 404 
   npm error 404 'spx-hash-based@*' is not in this registry. 
   npm error 404 npm error 404 
   Note that you can also install from a 
   npm error 404 tarball, folder, http url, or git url. 
   npm error A complete log of this run can be found 
   in: C:\Users\Dell\AppData\Local\npm-cache\_logs\2026-01-26T01_16_18_405Z-debug-0.log
   So for temporary fix run the this test file sphicsTEST.js by renaming the original
   
 * Temporary SPHINCS placeholder for testing
 * Generates pseudo-random key pairs (not actual SPHINCS, replace later)
 * Allows testing AES encryption, wallet derivation, and metadata.
 */

/**
 * Generate a pseudo SPHINCS key pair
 * @param {Buffer|null} seed - Optional deterministic seed
 * @returns {Object} { publicKey, privateKey } as hex strings
 */
export function generateKeyPair(seed = null) {
  const hexSeed = seed ? seed.toString("hex") : cryptoRandomHex(64);
  const pub = hexSeed.slice(0, 32);  // first 32 chars
  const priv = hexSeed.slice(32, 64); // last 32 chars
  return { publicKey: pub, privateKey: priv };
}

/**
 * Generate a random hex string
 * @param {number} length - Number of hex characters
 * @returns {string} Hex string
 */
function cryptoRandomHex(length) {
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}
