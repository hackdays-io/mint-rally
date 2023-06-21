## MintRally開発の前提となっている開発プラットホームをインストールする。
- Homebrew
- node
- yarn
  
の順番にインストールします。

## Homebrewをインストールする
[Homebrew](https://brew.sh/index_ja "配布元サイトへのリンク")は、macOS用のパッケージマネージャーです。以下の手順に従ってHomebrewをインストールします。

1. ターミナルを開きます。Spotlight検索（Cmd + Space）で「ターミナル」と入力して起動します。

2. ターミナルで以下のコマンドを実行して、Homebrewをインストールします。

   ```shell
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. インストール確認
   ```shell
   brew --version
   ``` 
   Homebrewのバージョンに指定はなく、バージョン情報が表示されれば、Homebrewのインストールが成功しているので次へ進んでください。
   もし、バージョン情報が表示されない場合は、インストールコマンドのタイプミスまたはネットワークエラーの可能性があるため、インストールログを確認してください。

## Nodeのインストール
Node.jsは、JavaScriptランタイム環境であり、サーバーサイドでJavaScriptを実行するためのプラットフォームです。以下の手順に従ってNodeをインストールします。
1. ターミナルで以下のコマンドを実行して、Node.jsをインストールします。
   ```shell
   brew install node@18
   ```
   MintRallyではversion16と18にて動作確認をとっています。
   そのためVersion18を指定してインストールしています。
   
3. インストール確認
   ```shell
   node -v
   ```
   もし、バージョン情報が表示されない場合は、インストールコマンドのタイプミスまたはネットワークエラーの可能性があるため、インストールログを確認してください。
   
## Yarnのインストール
Yarnは、JavaScriptのパッケージマネージャーであり、依存関係の管理と効率的なパッケージのインストールを行うツールです。以下の手順に従ってYarnをインストールします。
1. ターミナルで以下のコマンドを実行して、以下のコマンドを実行してYarnをインストールします。

   ```shell
   npm install -g yarn
   ```
   
2. インストール確認
   ```shell
   yarn --version
   ```
   バージョンは重要ではなく、バージョン情報が表示されれば、インストールが成功しているので次へ進んでください。
   もし、バージョン情報が表示されない場合は、インストールコマンドのタイプミスまたはネットワークエラーの可能性があるため、インストールログを確認してください。

## 補足
MintRallではNodeとYarnを必須としていますがHomebrewは必須としていません。  
従ってHomebrewを入れずにnodeをインストールすることは可能です。ですがHomebrewでnodeの管理をする事がMacでの開発のデファクトです。デファクトに従う事として本手順でもHomebrewをインストールしています。  
[MintRallの依存関係](https://github.com/hackdays-io/mint-rally/blob/main/docs/frontend.md#dependencies)に記載された制約に従う為にnodeの最新版ではなくてVersion16をインストールするようにしています。  
Nextは、package.jsonの内容に従ってyarnコマンドによって組み込まれるため手順書として登場させていません。  
ソースコードのエディタは何を使っても問題ありませんが、VSC(VisualStudioCode)がおすすめです。

