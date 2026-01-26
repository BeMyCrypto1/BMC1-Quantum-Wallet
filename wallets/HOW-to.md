# Next step in the workflow.

Your wallet program just finished loading or creating the master key. 

Now it’s asking:

How many wallets to create? (default 1)

What to do here
Decide how many wallets you want to generate in this run
Enter a number (e.g., 1) and press Enter

The wallet will create that many new wallets using your master key

How it works internally
Each wallet is derived deterministically from the master key + index
The program will save each wallet in storage/wallets/

Metadata (storage/metadata.json) will be updated with the wallet index, address, and file

After creation
You’ll see something like:

💡 Wallet #0 created: a1b2c3d4e5f67890...
✔ All done! Your wallets are stored in storage/wallets/

Tip

You can create more wallets later using the same master key and password
The program will automatically continue from the next index so no wallet is overwritten

If you want, I can walk you through what files appear in storage/ after you create 
these wallets, and explain what each file represents.

Do you want me to do that?

How many wallets to create? 1
💡 Wallet #0 created: caf04597f01603582b91c53d5dad9c6c481445b5

Perfect! That means your first wallet was successfully created.

Here’s what just happened:

Wallet #0 Details

Wallet index: 0 → the first wallet derived from your master key

Wallet address: caf04597f01603582b91c53d5dad9c6c481445b5 → a hash of the wallet’s public key

Wallet file: Encrypted and stored in storage/wallets/

The wallet is encrypted with your master password, so it’s secure even if someone gets the file.

What files/folders you now have

Inside storage/:

storage/
├─ master-keys/
│  └─ <your_master_key_file>.enc   <-- Encrypted master key
├─ wallets/
│  └─ wallet_caf04597f01603582b91c53d5dad9c6c481445b5.enc   <-- Your first wallet
└─ metadata.json                  <-- Tracks wallet #0 and its address/file


metadata.json looks something like this:

{
  "0": {
    "index": 0,
    "address": "caf04597f01603582b91c53d5dad9c6c481445b5",
    "file": "storage/wallets/wallet_caf04597f01603582b91c53d5dad9c6c481445b5.enc"
  }
}

Next Steps

You can run node src/index.js again to create more wallets.

The program will automatically start at index 1 for the next wallet.

All wallets are derived from the same master key, so they can always be recovered.

Keep your master password and master key file safe, as they are required to recover wallets.
