# React Convention

React 19のフロントエンドの画面と操作を、一つずつテストと実装の一続きで仕上げるClaude Code／Codex両対応marketplaceです。公開するインストール対象はpackage `react-convention`（`./plugins/react-convention`）1件で、公開入口は `develop-react-frontend` の一つです。

## こんなときに使う

**Reactの画面や操作を、業務の資料が決めたものだけで組み立てたいときに使う。** 画面は業務知識とクエリデータモデルが決めたものをその順で見せ、拒む理由を作らない。秘密と認可をServerの内側に閉じ、読み取りと更新の持ち主を一つにし、URLやformやbackendの応答の値を黙って丸めない。テストは、失敗を再現できる最小の層に一度だけ書く。

実行基盤はTanStack Start、React Router、React Server Componentsを使わないSPAのどれでも使えます。

## 利用例

```text
この貸出の画面を実装して。
```

```text
本を借りる操作をServer Functionとformで書いて。
```

```text
この部品のテストをどこで書くか決めて直して。
```

## インストール

インストールするのは `react-convention@react-convention` です。外部プラグインの追加は不要です。導入と更新の手順は、このworkspaceの他のpluginと同じです（`/Users/naoya-nakamoriq/Documents/Github/harness-pluginsv2/install-plugins.sh`）。

## 検証

```bash
bash scripts/validate.sh
bash /Users/naoya-nakamoriq/Documents/Github/harness-pluginsv2/scripts/validate.sh /Users/naoya-nakamoriq/Documents/Github/harness-pluginsv2/react-convention-plugins
```
