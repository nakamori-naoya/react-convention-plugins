---
description: X のクローンの SPA に、フォローする相手を探す画面（最初の一覧と、一人をフォローする操作）を develop-react-frontend でテストから書かせる。作業の前の repository には、backend を呼ぶ関数と利用者IDの型がある。
tags: [x-clone, react, implementation]
plugins: ["../../../plugins/react-convention"]
max_turns: 150
timeout_seconds: 3000
allowed_tools: [Read, Glob, Grep, Skill, TodoWrite, Write, Edit, Bash]
---

X のクローン（X に似た SNS）の画面に、「フォローする相手を探す」画面を足してください。範囲は、一覧の最初の部分を見せることと、一覧の一人をフォローする操作までです。一覧の続きを読むことは今回の範囲の外です。

## 作業場所

作業する repository は、この作業場所の `out/` です。React 19 の SPA で、依存は入れてあります。業務知識の資料は `out/docs/フォロー/business-knowledge.md`、backend の API の契約は `out/docs/api.md` にあります。資料は書き換えないでください。この環境は外のネットワークへ接続できないので、新しい依存は足せません。

## ほかの package のファイル

この環境には development-convention と testing-strategy の skill が入っていません。代わりに、その最新のファイルを `harness/` の下へ写してあります。skill がそれらの skill（`write-readable-code`、`apply-layer-convention`、`protect-entry-points`、`design-test-strategy`、`design-e2e-test-scenarios`）に従うよう求めたら、`harness/<名前>/` の下を読んでください。

## 問いと止まるとき

この実行には、問いに答える利用者がいません。skill が止まるよう定めた場面に当たったら、その部分は書かずに止まり、何が決まらず、どこが変わるかを報告してください。skill が仮置きして進めてよいとする場面は、仮置きして報告に挙げてください。

## 報告

最後に、日本語で、変更したファイル、画面と操作ごとに決めたこと、テストを置いた層、完了判定の結果、止まった点と提案を短く書いてください。
