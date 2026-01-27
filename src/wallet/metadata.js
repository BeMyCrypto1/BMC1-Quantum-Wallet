import fs from "fs-extra";
import path from "path";

const FILE = path.join("storage", "metadata.json");

/**
 * Add a new wallet entry to metadata
 * @param {Object} entry - { index, address, file }
 */
export function add(entry) {
  const data = fs.existsSync(FILE) ? fs.readJSONSync(FILE) : {};
  data[entry.index] = entry;
  fs.ensureFileSync(FILE);
  fs.writeJSONSync(FILE, data, { spaces: 2 });
}

/**
 * Get all wallet metadata
 * @returns {Object} All wallet entries
 */
export function getAll() {
  return fs.existsSync(FILE) ? fs.readJSONSync(FILE) : {};
}
