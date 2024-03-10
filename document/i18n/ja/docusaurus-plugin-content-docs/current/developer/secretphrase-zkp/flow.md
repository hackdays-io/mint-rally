---
sidebar_position: 1
---

# 概要

MintRally で参加者が NFT をうけとるためには、主催者から聞いたあいことばを入力します。入力したあいことばは Poseidon ハッシュ関数のハッシュ値に変換されたあと、ゼロ知識証明（Plonk アルゴリズム）によって暗号化され、セキュアにスマートコントラクトに保存されます。

## 使用技術

- 回路実装: Circom
- アルゴリズム: Plonk
- Powers of Tau: powersOfTau28_hez_final_12.ptau

## シーケンス図

```plantuml MetaTransactionSequence
@startuml

actor organizer
actor participant

group イベントの作成
    organizer -> organizer: あいことばをkeccak256ハッシュ化、\nそれをさらにposeidonハッシュ関数でハッシュ化
    organizer -> NextFunction: keccak256ハッシュ値とposeidonハッシュ値の両方を\nおくってproof生成リクエスト
    NextFunction -> NextFunction: Circuitをつかってwitnessを計算
    NextFunction -> NextFunction: witnessからproofとpublic signalsを生成し、\nそれぞれをsolidityのcalldataに変換
    NextFunction -> organizer: proofとpublic signalsのcalldataを返却
    organizer -> EventContract: イベント作成のtxデータにpublicInputCalldataをつけてtxを投げる
    EventContract -> MintNFTContract: イベントIDをキーに、あいことばの\npublicInputCalldataを保存する
end

group NFTのミント
    participant -> participant: あいことばをkeccak256ハッシュ化、\nそれをさらにposeidonハッシュ関数でハッシュ化
    participant -> NextFunction: keccak256ハッシュ値とposeidonハッシュ値の両方を\nおくってproof生成リクエスト
    NextFunction -> NextFunction: Circuitをつかってwitnessを計算
    NextFunction -> NextFunction: witnessからproofとpublic signalsを生成し、\nそれぞれをsolidityのcalldataに変換
    NextFunction -> participant: proofとpublic signalsのcalldataを返却
    participant -> MintNFTContract: NFTミントのtxデータにproofをつけてtxを投げる
    MintNFTContract -> VerifierContract: イベント作成時に保存したpublicInputCalldataと\nproofCalldataを投げて正しいproofかを検証
    MintNFTContract -> VerifierContract: 使用済みproofとして保存
end

@enduml
```
