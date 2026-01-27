# New Wallet Structure due to failed issues on prior one

    bmc1-quantum-wallet/
    ├─ src/
    │  ├─ crypto/
    │  │  ├─ kdf.js
    │  │  ├─ aes.js
    │  │  ├─ hash.js
    │  │  └─ sphincs.js
    │  └─ wallet/
    │     ├─ master.js
    │     ├─ derive.js
    │     ├─ crypto.js
    │     └─ metadata.js
    │  └─ index.js
    └─ storage/
       ├─ master-keys/
       └─ wallets/
    └─ metadata.json
    
