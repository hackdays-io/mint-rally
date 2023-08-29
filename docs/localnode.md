# Use Localhost node in development

### 1. Run local node

```
$ cd hardhat
```

Install node modules

```
$ yarn
```

Copy env file

```
$ cp .env.example .env
```

If you want to run local node on docker. please run this command.

```
$ docker-compose up
```

Otherwise, please run this command.

```
$ yarn localchain
```


### 2. Setup localnetwork in metamask and add a local wallet address

_You need to do this step only once, if you are already done this, skip to step4_

#### 2.1 Use this params to add localnetwork to metamask

Go to add network page

<img src="https://github.com/hackdays-io/mint-rally/assets/18475563/7fd6966e-6f65-41af-9bd1-960137478e85" width="300px">

Add Localnetwork

<img src="./documentImages/addlocalnet2metamask.png" width="300px" />

#### 2.2 Add local wallet to metamask

Get localnetwork wallet privatekey from console in docker.

<img src="./documentImages/importlocalwallet2metamask1.png" width="300px" />

Import wallet with privatekey

<img src="./documentImages/importlocalwallet2metamask2.png" width="300px" />

### 3. Set privatekey to contracts .env for deployment

_As same as step2 You need to do this step only once, if you are already done this, skip to step4_

```
...
LOCAL_PRIVATE_KEY=privatekey_you_got_from_console
...
```

### 4. Deploy contracts to local node

_You need to run this every time_

```
$ cd hardhat
```

```
$ yarn deploy:local
```

you will get like this

```
forwarder address: 0xa513E6E4b8f...
mintNFT address: 0x2279B7A0a...
eventManager address: 0x8A791620dd626...

----------
For frontEnd
----------
NEXT_PUBLIC_FORWARDER_ADDRESS=0xa513E6E4b8f...
NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER=0x2279B7A0a...
NEXT_PUBLIC_CONTRACT_EVENT_MANAGER=0x8A791620dd626...
```

### 5. Set contracts address to frontend .env

_This addresses change everytime you run deploy_

```
NEXT_PUBLIC_CONTRACT_EVENT_MANAGER=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Run frontend

If you don't build frontend development environment, please follow [this doc (Frontend)](./frontend.md)
