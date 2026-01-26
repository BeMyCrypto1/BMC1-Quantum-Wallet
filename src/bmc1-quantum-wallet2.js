import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import CryptoJS from 'crypto-js';
import chalk from 'chalk';
import { sha256 } from '@noble/hashes/sha256';
import { SPHINCS } from 'spx-hash-based';

const STORAGE_DIR = path.join(process.cwd(), 'storage');
const MASTER_DIR = path.join(STORAGE_DIR, 'master-keys');
const WALLETS_DIR = path.join(STORAGE_DIR, 'wallets');
const METADATA_FILE = path.join(STORAGE_DIR, 'metadata', 'wallet-index.json');

// Ensure folders exist
fs.ensureDirSync(MASTER_DIR);
fs.ensureDirSync(WALLETS_DIR);
fs.ensureDirSync(path.dirname(METADATA_FILE));

// --- Helpers ---

function encryptAES(data, password) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();
}

function decryptAES(ciphertext, password) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

function hashPubKey(pubKey) {
  return sha256(pubKey).slice(0, 20); // 20-byte address
}

function deriveWalletSeed(masterPrivateKey, index) {
  const data = Buffer.concat([Buffer.from(masterPrivateKey, 'hex'), Buffer.from([index])]);
  return sha256(data);
}

// --- Master Key ---

async function generateMasterKey() {
  const password = (await inquirer.prompt({
    type: 'password',
    name: 'password',
    message: 'Enter a new master password:',
    mask: '*'
  })).password;

  const sphincsKey = SPHINCS.generateKeyPair();
  const encrypted = encryptAES(sphincsKey, password);

  const timestamp = Date.now();
  const filename = path.join(MASTER_DIR, `qr_master_${timestamp}.json.enc`);
  fs.writeFileSync(filename, encrypted);
  console.log(chalk.green(`✅ Master key generated and encrypted: ${filename}`));
}

async function selectMasterKey() {
  const files = fs.readdirSync(MASTER_DIR);
  if (files.length === 0) {
    console.log(chalk.yellow('No master keys found. Generating a new one.'));
    await generateMasterKey();
    return selectMasterKey();
  }

  const choices = files.map((f, i) => ({ name: f, value: i }));
  const { index } = await inquirer.prompt({
    type: 'list',
    name: 'index',
    message: 'Select master key to use:',
    choices
  });

  const filename = path.join(MASTER_DIR, files[index]);
  const password = (await inquirer.prompt({
    type: 'password',
    name: 'password',
    message: 'Enter password for master key:',
    mask: '*'
  })).password;

  const encrypted = fs.readFileSync(filename, 'utf-8');
  const masterKey = decryptAES(encrypted, password);

  if (!masterKey) {
    console.log(chalk.red('❌ Failed to decrypt master key. Wrong password or corrupted file.'));
    process.exit(1);
  }

  return masterKey;
}

// --- Wallet Derivation ---

async function deriveWallet(masterKey, index) {
  const seed = deriveWalletSeed(masterKey.privateKey, index);
  const walletKey = SPHINCS.generateKeyPair(seed);

  const pubHash = hashPubKey(walletKey.publicKey);
  const encrypted = encryptAES(walletKey, masterKey);

  const walletFile = path.join(WALLETS_DIR, `wallet_${pubHash.toString('hex')}.json.enc`);
  fs.writeFileSync(walletFile, encrypted);
  console.log(chalk.green(`💡 Wallet #${index} created: ${walletFile}`));

  const metadata = fs.existsSync(METADATA_FILE) ? fs.readJSONSync(METADATA_FILE) : {};
  metadata[index] = { address: pubHash.toString('hex'), file: walletFile };
  fs.writeJSONSync(METADATA_FILE, metadata, { spaces: 2 });
}

// --- Main ---

async function main() {
  console.log(chalk.blue('🔗 BMC1 Quantum-Safe Wallet'));
  console.log('============================================================');

  const masterKey = await selectMasterKey();

  const { action } = await inquirer.prompt({
    type: 'list',
    name: 'action',
    message: 'Choose action:',
    choices: [
      { name: 'Create new wallet(s)', value: 'create' },
      { name: 'Exit', value: 'exit' }
    ]
  });

  if (action === 'create') {
    const metadata = fs.existsSync(METADATA_FILE) ? fs.readJSONSync(METADATA_FILE) : {};
    const lastIndex = Object.keys(metadata).length ? Math.max(...Object.keys(metadata)) + 1 : 0;

    const { count } = await inquirer.prompt({
      type: 'number',
      name: 'count',
      message: 'How many wallets to create?',
      default: 1,
      validate: input => Number.isInteger(input) && input > 0 ? true : 'Must be integer > 0'
    });

    for (let i = 0; i < count; i++) {
      await deriveWallet(masterKey, lastIndex + i);
    }
  }

  console.log(chalk.blue('✔ Done.'));
}

main();
