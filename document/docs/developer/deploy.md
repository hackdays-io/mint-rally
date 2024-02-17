# Deploy Contract on Testnet and Frontend on Vercel

## Deploy Contract

This document explains how to deploy to a testnet, but deploying to the mainnet can be done in almost the same way.

## 1. Create an OpenZeppelin Defender Account and Set Up Relayer and Autotask for Meta-Transactions

MintRally currently uses a service called Defender provided by OpenZeppelin for meta-transactions where the organizer bears the gas costs.

### 1.1 Create Defender Account

Access [Defender](https://www.openzeppelin.com/defender) and register as a new user.

### 1.2 Create Relayer

Create a Relayer by selecting the network you want to deploy to (Mumbai or Polygon). Gas costs will be paid from this Relayer.

![create relayer](documentImages/defender1.png)

To add MATIC as gas costs to the Relayer, please transfer funds to the Relayer's address from Metamask or similar. You can withdraw funds by clicking the 'Withdraw funds' button.

![relayer info](documentImages/defender2.png)

### 1.3 Create Relayer API Key

Open the menu by clicking on the gear icon located to the right of the Relayer name, and click the 'Create new API Key' button to issue an API key.

![generate api key](documentImages/defender-relayer-apikey.png)

Enter the issued key into the frontend environment variables under the names OZ_RELAYER_API_KEYS and OZ_RELAYER_API_SECRETS.

## 2. Set .env for Deployment

Set the following variables in your .env file. For deploying to Testnet, set variables starting with MUMBAI, and for Mainnet, set variables starting with POLYGON.

| Key | Value |
| --- | --- |
| MUMBAI_FORWARDER_ADDRESS | The Forwarder Address deployed to Mumbai testnet from Hardhat. For Mainnet deployment, set to `POLYGON_FORWARDER_ADDRESS`. |
| MUMBAI_RELAYER_ADDRESS | The Relayer Address obtained in 1.2. For Mainnet deployment, set to `POLYGON_RELAYER_ADDRESS`. |
| ETHERSCAN_API_KEY | Used for contract verification. Issue it from the scan service of the network you are deploying to. [Polygonscan](https://polygonscan.com/) |
| STAGING_ALCHEMY_KEY | Used to communicate with the blockchain during deployment. Issue from [Alchemy](https://www.alchemy.com/) by selecting the target network. For Mainnet deployment, set to `MAINNET_ALCHEMY_KEY`. |
| PRIVATE_KEY | Set the private key of the wallet that will be the contract creator. For Mainnet deployment, set to `MAINNET_PRIVATE_KEY`. |

## 3. Deploy to Testnet

### 3.1 Deploy to Testnet

```shell
// move to contract directory
$ cd hardhat

// deploy
$ yarn deploy:stg
```

Use `yarn deploy:main` when deploying to the mainnet.

After deploying to the testnet, the contract addresses will appear in the log.

```
forwarder address: 0x20a83f857c3632408486xxxxxxxxxx
mintNFT address: 0x51A0B20f98676f5EadB08870d0xxxxxxxxxx
eventManager address: 0xe26Df05190CD0f50c85C05Cb1B62xxxxxxxxxx

----------
For frontEnd
----------
NEXT_PUBLIC_FORWARDER_ADDRESS=0x20a83f857c3632408486b703036xxxxxxxxxx
NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER=0x51A0B20f98676f5EadB08870xxxxxxxxxx
NEXT_PUBLIC_CONTRACT_EVENT_MANAGER=0xe26Df05190CD0f50c85C05Cb1B6268xxxxxxxxxx
```

### 3.2 Verify Deployed Contract

Verify the contract so that it can be seen on the scan site. Even without verification, MintRally is usable, but by doing this, users can more easily understand the contract and trust it.

Replace `<address>` with the contract address you got in 3.1 and run it three times for MintNFT, EventManager, and Forwarder.

```
$ yarn verify --network mumbai <address>
```

## Upload Defender Autotask Code

Upload the source code to OpenZeppelin's Autotask that intermediates meta-transactions.

```
// build autotask script
$ yarn build

// upload script
$ yarn upload:stg
```


Use `yarn upload:prd` when deploying to the mainnet.

# Deploy Frontend

## 4. Setup and Deploy on Vercel

NOTE: When deploying on Vercel, please be aware that using the `hobby` plan may result in a timeout and failure during proof generation. Therefore, it is recommended to use the `pro` plan (a paid plan).

### 4.1 Create a New Project

After creating an account on Vercel, go to the new project creation screen by selecting `Add New`, then `Project`.

![create new project](documentImages/vercel1.png)

Select the MintRally repository and click `Import`.
![import github](documentImages/vercel2.png)

### 4.2 Setup Vercel

Decide on any project name, choose `Next.js` for Framework Preset. Open the `Edit` screen from RootDirectory, select the frontend directory, and click `Continue`.

![import github](documentImages/vercel3.png)

![change root](documentImages/vercel4.png)

### 4.3 Set Environment Variables

Set the following environment variables in the Environment Variables section. Once you've set the variables, click the `Deploy` button to complete the setup.

![env](documentImages/vercel5.png)

| Key | Value |
| --- | --- |
| NEXT_PUBLIC_FORWARDER_ADDRESS | The forwarder contract address created in step 3.1 |
| NEXT_PUBLIC_CONTRACT_EVENT_MANAGER | The event manager contract address created in step 3.1 |
| NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER | The mint NFT manager contract address created in step 3.1 |
| NEXT_PUBLIC_WEBHOOK_URL | The webhook URL obtained in 1.3 |
| NEXT_PUBLIC_PROVIDER_RPC | Issue from [Alchemy](https://www.alchemy.com/) by selecting the target network. It can be the same one used during contract deployment |
| NEXT_PUBLIC_CHAIN_ID | `80001` for Testnet, `137` for Mainnet |
| NEXT_PUBLIC_CHAIN_NAME | `Polygon Testnet` or `Polygon Mainnet` |
| NEXT_PUBLIC_BLOCK_EXPLORER_URL | `https://mumbai.polygonscan.com/` for Testnet, `https://polygonscan.com` for Mainnet |
| NEXT_PUBLIC_METAMASK_RPC_URL | The RPC URL for the wallet: `https://matic-mumbai.chainstacklabs.com` for Testnet, `https://polygon-rpc.com` for Mainnet |
| NEXT_PUBLIC_PINATA_JWT | Follow the instruction describing how to get a Pinata JWT. [link](/docs/frontend.md#create-pinata-jwt) |
| NEXT_PUBLIC_PINATA_GATEWAY | The general gateway URI is `gateway.pinata.cloud`. If you want to use your own gateway, please refer to the Pinata documentation |
| OZ_RELAYER_API_KEYS | Insert the Openzeppelin Relayer API Keys obtained in step 1.3 as an array |
| OZ_RELAYER_API_SECRETS | Insert the Openzeppelin Relayer API Secrets obtained in step 1.3 as an array |