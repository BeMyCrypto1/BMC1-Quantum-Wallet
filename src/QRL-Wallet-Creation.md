# Next logical step: 

— Install all required **npm dependencies** and run the wallet so it can generate your 
  first master key and wallet.

  Follow all instructions below

  From inside your BMC1-Quantum-Wallet root folder ype or -copy paste- on your terminal:

    npm init -y


-It Creates a package.json file

- Sets up your project for npm packages ready.

# Now Install required packages
Run this command in PowerShell terminal:

    npm install fs-extra inquirer crypto-js @noble/hashes spx-hash-based


Packages included:

  Package	Purpose descriptions
    fs-extra	File system helpers (read/write JSON, ensure directories)
    inquirer	CLI prompts for password and wallet count
    crypto-js	AES encryption and PBKDF2 key derivation
    @noble/hashes	SHA3-256 / SHA3-512 for quantum-resistant hashing
    spx-hash-based	SPHINCS quantum-resistant signature key pairs

# Next Step Run the wallet

Now run the wallet:

    node src\index.js


You will be prompted for:

Master password
Number of wallets to create
After completion, you’ll see:

  ✅ New master key created.
  💡 Wallet #0 created: <wallet_address>
  ✔ All done! Your wallets are stored in storage/wallets/

You can see the wallets in the following folders below:
    storage/master-keys → contains your encrypted master key
    storage/wallets → contains encrypted wallets
    storage/metadata.json → tracks wallet index/address/file

Once this runs successfully, your first QC-safe wallet is READY!!!.

# NOTE:

  ## Need to follow all steps properly as shown

ENSURE TO WRITE DOWN THE PASSWORD 
you have chosen to run the wallet creation project...

If you loose it... you lose access to any wallets created
the phrases/keys are lost forever since they are all encripted
and can't be descripted if password is lost

REMEMBER  the password 


