# React Convention

React 19のフロントエンドを、Server境界、外から来た値、テストの分担の規約に沿って実装し、テストするClaude Code／Codex両対応marketplaceです。公開するインストール対象はpackage `react-convention`（`./plugins/react-convention`）1件で、公開入口は `implement-react-boundary` と `test-react-ui` の二つです。

## こんなときに使う

**Reactの画面や部品を、どこで何を実行し、境界を何が越えるかを決めたうえで書きたいときに使う。** 秘密と認可をServerの内側に閉じ、Server Functionを外から叩ける入口として守り、URLやformの値を黙って丸めないようにする。テストは、振る舞いごとに最も安い一つの層で、自分のコードを差し替えずに書く。

実行基盤はTanStack Start、Next.js、React Server Componentsを使わないSPAのどれでも使えます。実行基盤ごとの書き方は、`implement-react-boundary` の `references/framework-examples.md` に判断例として置いています。

## 利用例

```text
この貸出一覧の画面を、Server境界の規約に沿って実装して。
```

```text
延長のmutationをServer FunctionとActionで書いて。
```

```text
この部品のテストを、どの層で書くか決めて書いて。StorybookとVitestで重なっていないかも見て。
```

## このpackageが持つ判断

`react-convention` は、React 19のフロントエンドで、readを誰が持つか、Clientにする範囲、境界を越えてよい値、Server Functionの入口としての守り方と結果の型、外から来た値を丸めないこと、状態とURLとbrowser storageの置き場、Effectを使ってよい条件、React Compilerを採用したときの純粋さとメモ化、ブラウザ側の防御（CSRF、Cookie、CSP）、部品の責務の分け方を持つ。テストでは、振る舞いを単体、storyとbrowser test、Serverの境界、部品、E2Eのどの層で確かめるか、何を差し替えてよいか、何で確かめ、どう待つかを持つ。リポジトリ全体のテスト戦略と、どの経路をE2Eへ残すかは持たず、repositoryのテスト戦略に従う。

## インストール

インストールするのは `react-convention@react-convention` です。外部プラグインの追加は不要です。導入と更新の手順は、このworkspaceの他のpluginと同じです（`/Users/naoya-nakamoriq/Documents/Github/harness-pluginsv2/install-plugins.sh`）。

## 検証

```bash
bash scripts/validate.sh
bash /Users/naoya-nakamoriq/Documents/Github/harness-pluginsv2/scripts/validate.sh /Users/naoya-nakamoriq/Documents/Github/harness-pluginsv2/react-convention-plugins
```

`scripts/validate.sh` は、root契約（配置、manifest、禁止参照形）、両runtimeのmanifestとmarketplaceの一致、入口の構成、意味評価fixtureの形を検査します。規約の内容が目的に適うかは、意味評価として残ります。
