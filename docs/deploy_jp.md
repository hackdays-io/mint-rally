# Deploy contract on testnet and frontend on vercel

# Deploy contract

本ドキュメントではテストネットへのデプロイ方法を説明しますが、メインネットへのデプロイもほとんど同じようにできます。

## 1. Create Openzeppeline Defender account and setup relayer and autotask for Metatransaction

MintRally では現在ガス代を主催者が負担するメタトランザクションに Openzellelin が提供する Defender というサービスを用いています。

### 1.1 Create Defender account

[Defender](https://www.openzeppelin.com/defender)にアクセスして、新規ユーザー登録をしてください。

### 1.2 Create Relayer

デプロイ対象のネットワーク（Mumbai もしくは Polygon）を選択して、Relayer を作成してください。この Relayer からガス代が支払われます。

![create relayer](documentImages/defender1.png)

Relayer にガス代となる MATIC を追加するときは、Metamask などから Relayer のアドレスに向けて送金してください。引き出すときには Withdraw funds のボタンから引き出すことができます。

![relayer info](documentImages/defender2.png)

### 1.3 Create Relayer API Key

Relayer 名の右にある歯車アイコンからメニューを開き、Crete new API Key ボタンを押して API キーを発行してください。

![generate api key](documentImages/defender-relayer-apikey.png)

発行したキーは **OZ_RELAYER_API_KEYS** と **OZ_RELAYER_API_SECRETS** の名前でフロントエンドの環境変数にいれます。

## 2 Set .env for deployment

.env ファイルに以下の変数をセットしてください。Testnet へのデプロイでは MUMBAI から始まる変数、Mainnet へのデプロイでは POLYGON から始まる変数をセットしてください。

| Key                      | Value                                                                                                                                                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MUMBAI_FORWARDER_ADDRESS | Hardhat から mumbai テストネットにデプロイした ForwarderAddress。メインネットにデプロイする際は`POLYGON_FORWARDER_ADDRESS` にセットしてください。                                                                                                                                                        |
| MUMBAI_RELAYER_ADDRESS   | 1.2 で入手した RelayerAddress。メインネットにはデプロイする際は`POLYGON_RELAYER_ADDRESS` にセットしてください。                                                                                                                                                                                              |
| ETHERSCAN_API_KEY        | Contract を Verify するときに使います。デプロイ対象のネットワークの scan サービスから発行してください。[Polygonscan](https://polygonscan.com/)                                                                                                                                                               |
| STAGING_ALCHEMY_KEY      | デプロイ時にブロックチェーンと通信するためにつかいます。[Alchemy](https://www.alchemy.com/)こちらから対象ネットワークを選択して発行してください。 `https://polygon-mumbai.g.alchemy.com/v2/vGk7cESxz`のような URL を入力します。メインネットにはデプロイする際は`MAINNET_ALCHEMY_KEY` にセットしてください。 |
| PRIVATE_KEY              | コントラクト作成者となるウォレットのプライベートキーをセットしてください。メインネットにはデプロイする際は`MAINNET_PRIVATE_KEY` にセットしてください。                                                                                                                                                       |

## 3. Deploy to Testnet

### 3.1 テストネットに Deploy

```
// move to contract directory
$ cd hardhat

// deploy
$ yarn deploy:stg
```

メインネットに Deploy するときは`yarn deploy:main`

テストネットへのデプロイが完了するとコントラクトのアドレスがログにでます。

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

### 3.2 Verify deployed contract

Contract を Verify（検証）してスキャンサイトからどんなコントラクトなのかを見られるようにします。しなくても MintRally は使えますが、これをすることでどんなコントラクトかがわかりやすくなり、ユーザーは信頼しやすくなります。

`<address>`を 3.1 で得られたコントラクトアドレスに変えて、MintNFT、EventManager、Forwarder の 3 回実行します。

```
$ yarn verify --network mumbai <address>
```

# Deploy Frontend

## 4. Setup and Deploy on Vercel

注意：Vercelにデプロイした際、`hobby`プランではproof生成時にタイムアウトとなり処理が失敗する可能性がありますので、`pro`プラン（課金プラン）の使用をお勧めします。

### 4.1 Create new project

Vercel でアカウント作成したら、`Add New`、`Project`で新規プロジェクト作成画面に入ってください。

![create new project](documentImages/vercel1.png)

MintRally のレポジトリを選択して、`Import`してください。
![import github](documentImages/vercel2.png)

### 4.2 Setup Vercel

任意のプロジェクト名を決めたら、Framework Preset で`Next.js`を選択します。  
RootDirectory から`Edit`画面を開き、frontend のディレクトリを選択して`Continue`します。

![import github](documentImages/vercel3.png)

![change root](documentImages/vercel4.png)

### 4.3 Set env variable

Environment Variables の欄に以下の環境変数をセットしてください。
環境変数をセットしたら `Deploy` ボタンを押して完了です。

![env](documentImages/vercel5.png)

| Key                                   | Value                                                                                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_FORWARDER_ADDRESS         | A forwarder contract address created by step 3.1                                                                                                     |
| NEXT_PUBLIC_CONTRACT_EVENT_MANAGER    | A event manager contract address created step 3.1                                                                                                    |
| NEXT_PUBLIC_CONTRACT_MINT_NFT_MANAGER | A mint NFT manager contract address step 3.1                                                                                                         |
| NEXT_PUBLIC_PROVIDER_RPC              | [Alchemy](https://www.alchemy.com/)こちらから対象ネットワークを選択して発行してください。 コントラクトデプロイ時につかったものと同じでも大丈夫です。 |
| NEXT_PUBLIC_CHAIN_ID                  | Testnet: `80001`, Mainnet: `137`.                                                                                                                    |
| NEXT_PUBLIC_CHAIN_NAME                | A chain name: `Polygon Testnet` or `Polygon  Mainnet`.                                                                                               |
| NEXT_PUBLIC_BLOCK_EXPLORER_URL        | A Block Explorer URL. Testnet: `https://mumbai.polygonscan.com/` Mainnet: `https://polygonscan.com`.                                                 |
| NEXT_PUBLIC_METAMASK_RPC_URL          | A PRC URL for the wallet Testnet: `https://matic-mumbai.chainstacklabs.com`, Mainnet: `https://polygon-rpc.com`.                                     |
| NEXT_PUBLIC_PINATA_JWT                | following instraction describing how to get pinata jwt. [link](/docs/frontend.md#create-pinata-jwt)                                                  |
| NEXT_PUBLIC_PINATA_GATEWAY            | A general gateway uri is `gateway.pinata.cloud`. If you want to use your own gateway please refer pinata doc                                         |
| OZ_RELAYER_API_KEYS                   | 1.3 で入手した Openzeppelin Relayer API Keys を配列でいれる                                                                                          |
| OZ_RELAYER_API_SECRETS                | 1.3 で入手した Openzeppelin Relayer API Secrets を配列で入れる                                                                                       |
