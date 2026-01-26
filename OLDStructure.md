# Quantum Ready Wallet File Structure


    BMC1-Quantum-Wallet/
    ├── storage/
    │   ├── master-keys/
    │   │   └── qr_master_<timestamp>.json.enc
    │   ├── wallets/
    │   │   └── wallet_<address>.json.enc
    │   ├── migrations/
    │   │   └── migration_<old>_to_<new>.json
    │   ├── audit/
    │   │   └── security-audit.log
    │   └── metadata/
    │       └── wallet-index.json
    │
    ├── src/
    │   └── bmc1-quantum-wallet.js
    │
    ├── package.json
    ├── README.md
    └── .gitignore

# Master Keys (Immutable) from above structure are designed
to :

**Code and secrets are separated
Easy backups
Easy audits
Safe upgrades**
        
        qr_master_<unixTimestamp>.json.enc

# that file named to be..
    ✔ Never modified
    ✔ Never deleted
    ✔ Only rotated by creating a new one

These are identity anchors.

# The rest Wallet Files are (Rotatable)

    wallet_<0xPolygonAddress>.json.enc


✔ May be rotated
✔ May be deprecated
✔ Address-based naming prevents confusion

# Migration Bundles (Proof Artifacts)

    migration_<oldAddress>_to_<newAddress>.json

✔ Never encrypted (proof, not secrets)
✔ Used for audits and recovery
✔ Must not be altered

# Audit Logs (Append-Only)

    security-audit.log

✔ Append-only
✔ Never overwritten
✔ Consider periodic backups

# What Is NOT Changing

These things do not need renaming:
    Wallet JSON structure
    Encryption formats
    Cryptographic algorithms
    Polygon mainnet usage
    You are only standardizing paths and names, not crypto.
