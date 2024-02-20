---
sidebar_position: 5
---

# 依存ライブラリのインストール（Mac）

- Homebrew
- node
- yarn

の順番にインストールします。

## Homebrew をインストールする

[Homebrew](https://brew.sh/index_ja '配布元サイトへのリンク')は、macOS 用のパッケージマネージャーです。以下の手順に従って Homebrew をインストールします。

1. ターミナルを開きます。Spotlight 検索（Cmd + Space）で「ターミナル」と入力して起動します。

2. ターミナルで以下のコマンドを実行して、Homebrew をインストールします。

   ```shell
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

3. インストール確認
   ```shell
   brew --version
   ```
   Homebrew のバージョンに指定はなく、バージョン情報が表示されれば、Homebrew のインストールが成功しているので次へ進んでください。
   もし、バージョン情報が表示されない場合は、インストールコマンドのタイプミスまたはネットワークエラーの可能性があるため、インストールログを確認してください。

## Node のインストール

Node.js は、JavaScript ランタイム環境であり、サーバーサイドで JavaScript を実行するためのプラットフォームです。以下の手順に従って Node をインストールします。

1. ターミナルで以下のコマンドを実行して、Node.js をインストールします。

   ```shell
   brew install node@18
   ```

   MintRally では version16 と 18 にて動作確認をとっています。
   そのため Version18 を指定してインストールしています。

2. Node のバージョン指定しているので"keg-only"となっており、PATH が通されていないはずなので以下のコマンドを実行する。

   ```shell
   'export PATH="/opt/homebrew/opt/node@18/bin:$PATH"' >> ~/.zshrc"
   ```

3. インストール確認
   ```shell
   node -v
   ```
   もし、バージョン情報が表示されない場合は、インストールコマンドのタイプミスまたはネットワークエラーの可能性があるため、インストールログを確認してください。

## Yarn のインストール

Yarn は、JavaScript のパッケージマネージャーであり、依存関係の管理と効率的なパッケージのインストールを行うツールです。以下の手順に従って Yarn をインストールします。

1. ターミナルで以下のコマンドを実行して、以下のコマンドを実行して Yarn をインストールします。

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

MintRall では Node と Yarn を必須としていますが Homebrew は必須としていません。  
従って Homebrew を入れずに node をインストールすることは可能です。ですが Homebrew で node の管理をする事が Mac での開発のデファクトです。デファクトに従う事として本手順でも Homebrew をインストールしています。  
[MintRall の依存関係](https://github.com/hackdays-io/mint-rally/blob/main/docs/frontend.md#dependencies)に記載された制約に従う為に node の最新版ではなくて Version16 をインストールするようにしています。  
Next は、package.json の内容に従って yarn コマンドによって組み込まれるため手順書として登場させていません。  
ソースコードのエディタは何を使っても問題ありませんが、VSC(VisualStudioCode)がおすすめです。
