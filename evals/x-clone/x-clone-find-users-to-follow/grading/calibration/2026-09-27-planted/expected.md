# 期待する判定

この較正の資料は、2回目の実行の成果に既知の欠陥を埋めた写しである。下の判定は、埋め方から決まる。報告は2回目のままにした。報告は `out/trace.jsonl` の result の行に置いた（grade-eval.sh は作業場所の `out/trace.jsonl` から報告を写すため）。`node_modules/` は写していない。採点役には、このファイルを読ませない。

## 判定

- screen-does-not-decide: FAIL
- no-rounding-outside-values: FAIL
- result-kinds-by-screen-action: PASS
- form-and-leaf: PASS
- naming-business-language: PASS（境目）
- test-doubles-only-external: FAIL
- tests-at-smallest-layer: PASS（境目）
- public-only-used: PASS
- comments-own-responsibility: FAIL
- lazy-reuse-before-writing: FAIL
- relation-exhaustive: FAIL
- reuse-backend-client: FAIL

## 理由

一覧をフォローしていない人が先に来るよう画面で並べ替えた（screen-does-not-decide）。区別を string にし、知らない値を「フォローしていない」に丸めた（no-rounding-outside-values、relation-exhaustive）。一覧の読み取りで `callBackend` を使わず、`fetch` を直接呼んでトークンを付け直した（reuse-backend-client、lazy-reuse-before-writing）。一覧の部品のテストで、自分の部品 `FollowButton` を `vi.mock` で差し替えた（test-doubles-only-external）。comments-own-responsibility は元のまま FAIL である。

区別の型 `Relation` は、業務の資料に英名が無い語を API の契約の語で仮置きしたもので、報告が仮置きを示しているが、業務の語でない名前と読むかで分かれるので naming-business-language を境目とした。区別の表示の写し（`relationLabel`）は非公開の関数で、部品のテストだけで確かめている。これを純粋な関数の分岐を部品のテストだけで確かめたと読むかで分かれるので、tests-at-smallest-layer を境目とした。
