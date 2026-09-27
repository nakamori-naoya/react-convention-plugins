# 期待する判定

この較正の資料は、2026-09-27 の2回目の実行（claude plugin eval、`--runs 1 --ablation none`）で作られた repository と報告である。1回目は scaffold が devDependencies を入れられず、テストを実行できなかったので使わない。下の判定は、eval を組んだ担当がコードと報告と資料を読んで出した。報告は `out/trace.jsonl` の result の行に置いた（grade-eval.sh は作業場所の `out/trace.jsonl` から報告を写すため）。`node_modules/` は写していない。採点役には、このファイルを読ませない。

## 判定

- screen-does-not-decide: PASS
- no-rounding-outside-values: PASS
- result-kinds-by-screen-action: PASS
- form-and-leaf: PASS
- naming-business-language: PASS（境目）
- test-doubles-only-external: PASS
- tests-at-smallest-layer: PASS（境目）
- public-only-used: PASS
- comments-own-responsibility: FAIL
- lazy-reuse-before-writing: PASS
- relation-exhaustive: PASS
- reuse-backend-client: PASS

## 理由

comments-own-responsibility は、`vite.config.ts` のコメント「MSW が差し替える backend の base URL」が使う側の都合を書いているので FAIL とした。`follow-user.ts` の「fetch は接続が切れたときだけ TypeError で失敗する」は、分岐を読むのに要る外部の API の事実で、断り書きではない。一覧は backend の順のまま描き、区別は三つの値の union で `never` まで網羅し、backend の呼び出しは作業の前からあった `callBackend` を使っている。

区別の型 `Relation` は、業務の資料に英名が無い語を API の契約の語で仮置きしたもので、報告が仮置きを示しているが、業務の語でない名前と読むかで分かれるので naming-business-language を境目とした。区別の表示の写し（`relationLabel`）は非公開の関数で、部品のテストだけで確かめている。これを純粋な関数の分岐を部品のテストだけで確かめたと読むかで分かれるので、tests-at-smallest-layer を境目とした。
