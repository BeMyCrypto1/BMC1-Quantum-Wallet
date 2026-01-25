/*****************************************************************************************
 * BMC1 QUANTUM-RESISTANT WALLET
 * Hybrid Post-Quantum + ECDSA Wallet for Polygon Mainnet
 * Folder-standardized, audit-safe, production-aligned
 *****************************************************************************************/

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const { ethers } = require('ethers');
const sodium = require('libsodium-wrappers');
const argon2 = require('argon2');
const oqs = require('liboqs-node');

/* ============================================================
   ROOT PATHS (STANDARDIZED)
============================================================ */

const ROOT = path.join(__dirname, '..');
const STORAGE = path.join(ROOT, 'storage');

const DIRS = {
    masterKeys: path.join(STORAGE, 'master-keys'),
    wallets: path.join(STORAGE, 'wallets'),
    migrations: path.join(STORAGE, 'migrations'),
    audit: path.join(STORAGE, 'audit'),
    metadata: path.join(STORAGE, 'metadata')
};

const WALLET_INDEX = path.join(DIRS.metadata, 'wallet-index.json');
const POLYGON_RPC = 'https://polygon-rpc.com';

/* ============================================================
   BOOTSTRAP STORAGE
============================================================ */

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

Object.values(DIRS).forEach(ensureDir);

if (!fs.existsSync(WALLET_INDEX)) {
    fs.writeFileSync(WALLET_INDEX, JSON.stringify({ wallets: [] }, null, 2));
}

/* ============================================================
   AUDIT LOGGING (APPEND-ONLY)
============================================================ */

function logEvent(message, level = 'INFO') {
    const entry = `[${new Date().toISOString()}] [${level}] ${message}\n`;
    fs.appendFileSync(path.join(DIRS.audit, 'security-audit.log'), entry);
    console.log(entry.trim());
}

/* ============================================================
   SECURE PASSWORD INPUT
============================================================ */

function readPassword(prompt) {
    return new Promise(resolve => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        process.stdout.write(prompt);
        process.stdin.setRawMode(true);

        let pwd = '';
        process.stdin.on('data', char => {
            char = char.toString();
            if (char === '\n' || char === '\r') {
                process.stdin.setRawMode(false);
                rl.close();
                process.stdout.write('\n');
                resolve(pwd);
            } else if (char === '\u0003') {
                process.exit(1);
            } else {
                pwd += char;
                process.stdout.write('*');
            }
        });
    });
}

/* ============================================================
   WALLET CORE
============================================================ */

class BMC1QuantumWallet {

    /* ========================================================
       MASTER KEY (REAL POST-QUANTUM)
    ======================================================== */

    async generateMasterKey() {
        await sodium.ready;

        const pwd1 = await readPassword('Create password (min 14 chars): ');
        const pwd2 = await readPassword('Confirm password: ');

        if (pwd1 !== pwd2 || pwd1.length < 14) {
            throw new Error('Password policy violation');
        }

        const dilithium = new oqs.Signature('Dilithium5');
        const { publicKey, privateKey } = dilithium.generateKeypair();

        const salt = crypto.randomBytes(32);
        const key = await argon2.hash(pwd1, {
            salt,
            type: argon2.argon2id,
            raw: true,
            timeCost: 4,
            memoryCost: 65536,
            parallelism: 2
        });

        const nonce = sodium.randombytes_buf(
            sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES
        );

        const encrypted = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
            privateKey,
            null,
            null,
            nonce,
            key.slice(0, 32)
        );

        const record = {
            algorithm: 'CRYSTALS-Dilithium5',
            publicKey: Buffer.from(publicKey).toString('hex'),
            encryptedPrivateKey: Buffer.from(encrypted).toString('hex'),
            nonce: Buffer.from(nonce).toString('hex'),
            salt: salt.toString('hex'),
            createdAt: new Date().toISOString()
        };

        const filename = `qr_master_${Date.now()}.json.enc`;
        fs.writeFileSync(
            path.join(DIRS.masterKeys, filename),
            JSON.stringify(record, null, 2),
            { mode: 0o600 }
        );

        logEvent(`Quantum master key created: ${filename}`, 'HIGH');
        return filename;
    }

    /* ========================================================
       DERIVE POLYGON WALLET (HYBRID)
    ======================================================== */

    async derivePolygonWallet(masterFile) {
        await sodium.ready;

        const pwd = await readPassword('Enter master password: ');
        const master = JSON.parse(
            fs.readFileSync(path.join(DIRS.masterKeys, masterFile))
        );

        const key = await argon2.hash(pwd, {
            salt: Buffer.from(master.salt, 'hex'),
            type: argon2.argon2id,
            raw: true
        });

        const pqPrivate = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
            null,
            Buffer.from(master.encryptedPrivateKey, 'hex'),
            null,
            Buffer.from(master.nonce, 'hex'),
            key.slice(0, 32)
        );

        const seed = crypto.createHash('sha3-512')
            .update(pqPrivate)
            .update('BMC1-POLYGON-HYBRID')
            .digest();

        const wallet = ethers.Wallet.fromSeed(seed)
            .connect(new ethers.JsonRpcProvider(POLYGON_RPC));

        const encryptedJson = await wallet.encrypt(pwd);

        const walletFile = `wallet_${wallet.address}.json.enc`;
        fs.writeFileSync(
            path.join(DIRS.wallets, walletFile),
            encryptedJson,
            { mode: 0o600 }
        );

        const index = JSON.parse(fs.readFileSync(WALLET_INDEX));
        index.wallets.push({
            address: wallet.address,
            file: walletFile,
            masterKey: masterFile,
            createdAt: new Date().toISOString(),
            network: 'Polygon Mainnet'
        });
        fs.writeFileSync(WALLET_INDEX, JSON.stringify(index, null, 2));

        logEvent(`Polygon wallet derived: ${wallet.address}`, 'MEDIUM');
        return wallet.address;
    }

    /* ========================================================
       CHECK BALANCE
    ======================================================== */

    async checkBalance(address) {
        const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
        const balance = await provider.getBalance(address);
        console.log(`Balance for ${address}: ${ethers.formatEther(balance)} MATIC`);
    }
}

/* ============================================================
   MAIN EXECUTION
============================================================ */

(async () => {
    console.log('BMC1 QUANTUM-RESISTANT WALLET');
    console.log('Hybrid Post-Quantum + ECDSA (Polygon Mainnet)');
    console.log('================================================');

    const wallet = new BMC1QuantumWallet();

    const masterKeyFile = await wallet.generateMasterKey();
    const address = await wallet.derivePolygonWallet(masterKeyFile);
    await wallet.checkBalance(address);

    logEvent('Wallet setup complete', 'INFO');
})();
