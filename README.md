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

## 検証の eval

develop-react-frontend が、業務の資料と backend の契約から利用者の原則に沿った画面をテストから書けるかは、root の `evals/` の下のケースで確かめる。実行は `claude plugin eval` が受け持ち、出来の採点は、作業したエージェントとは別の Claude（採点役）が、条件ごとに判定と根拠の引用を書いて受け持つ。今は、X のクローンの「フォローする相手を探す」画面（最初の一覧と、一人をフォローする操作）のケースを一つ置いている。

`evals/scaffold.sh` は、ケースの `fixture/`（React 19 の SPA と、backend を呼ぶ関数と利用者IDの型）を手元だけの git repository（`out/`）に写し、依存を入れ、skill が名前で指す development-convention と testing-strategy の skill を兄弟 checkout から `harness/` へ写す。eval の実行はサンドボックスの中で外へ接続できないので、依存は scaffold が先に入れる。Storybook と E2E の仕組みは入れていないので、表示の部品の story と browser test、E2E の判断はこのケースでは確かめない。ケースには、`prompt.md`、`case.yaml`、`scaffold.sh`、読まずに判定できること（skill を使ったか、テストを走らせたか、実装のファイルを書く前にテストか型の検査が失敗したか）だけの `graders/`、固有の条件 `grading/criteria.md`、較正の資料 `grading/calibration/`（実際の成果と、既知の欠陥を埋めた写しの二本と、それぞれの `expected.md`）を置く。共通の条件は `evals/criteria/react-screen.md`、採点役への指示は `evals/criteria/brief.md` にある。

```bash
claude plugin eval . --case x-clone-find-users-to-follow \
  --runs 1 --ablation none --keep-temp \
  --scaffold --allow-tools Write Edit Bash \
  --max-cost-usd 20 --no-publish
bash /Users/naoya-nakamoriq/Documents/Github/harness-pluginsv2/harness-tools/tools/grade-eval.sh \
  "$(pwd)/evals/x-clone/x-clone-find-users-to-follow" /private/tmp/e-XXXXXX
```

採点役は3回回し、条件ごとの多数決に重み（利用者の原則の芯を3、骨組みを2、細部を1）を掛けて100点満点にする。85点以上は「実用に足る」、70点以上は「手直しで使える」、70点未満は「作り直しが要る」である。条件や採点役への指示を変えたら、較正の資料に採点役をかけ、`expected.md` を三つ目の引数に渡して一致を確かめる。結果は `evals/results/` に書かれ、git の管理から外してある。
