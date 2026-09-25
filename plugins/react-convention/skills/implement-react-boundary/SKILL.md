---
name: implement-react-boundary
description: React 19のフロントエンドで、画面のread、mutation、Client部品を、秘密と認可をServerの内側に閉じ、Server Functionを独立した入口として扱い、外から来た値を丸めない形で実装する・直す。「この画面を実装して」「このmutationをServer FunctionとActionで書いて」「この部品をClientにするべきか決めて直して」と言われたときに使う。テストを書くことは `test-react-ui`、リポジトリ全体のテスト戦略は repository の決定へ返す。
---

# implement-react-boundary

React 19 の画面、Server Function、Client 部品を、どこで何を実行し、境界を何が越えるかを決めてから実装する。実行基盤（TanStack Start、Next.js など）が違っても、判断は同じである。

## 本質

この規約の大半は、次の六つから導かれる。

秘密と認可は Server の内側に閉じる。ブラウザへ渡すのは、認可済みで直列化できる値（DTO、ID、有限の状態）と Server Function の参照だけである。ブラウザに届いた値は表示のための写しであって、次の操作を許す証拠にはならない。

Server Function は、画面から呼ばれる関数である前に、外から直接叩ける独立した HTTP の入口である。だから、入力の検証、認証、認可を関数の内側で毎回行い、画面の route guard を認可の根拠にしない。

外から来た値（URL、form、外部の応答、browser storage）は、期待する型でなければ既定値へ丸めず、利用者に見える失敗にする。黙って丸めると、壊れた入力が正しい操作に化け、誰も気付かない。

一つの read の持ち主は、初期表示から更新後の再描画まで一つにする。初期表示は Server Component が持つことを既定にし、Client が持つのは、query の入力がブラウザにしか無いか、表示中に取り直し続けることが要求のときだけである。持ち主を途中で替えると、二つの cache が同じ事実を別々に持つ。

描画は純粋に保ち、Effect は外部システムとの同期だけに使う。導出できる値は state に置かず描画中に計算する。React Compiler の自動メモ化も、この純粋さを前提にしている。

Client にするのは、利用者の event、ブラウザ API、state、Context の購読が要る最小の葉だけである。Client 部品を子に持つことは、親を Client にする理由にならない。

## 場面ごとに読む資料

実行基盤を確かめたら、[実行基盤ごとの判断例](references/framework-examples.md) でその書き方を読む。React Server Components を使えない構成（Vite と React だけの SPA など）では、「初期表示は Server Component が持つ」を課さず、HTTP の入口を Server Function と同じく守る。どちらか読み取れなければ止まる。

read の持ち主、境界を越えてよい値、並行と待機の境界を決めるときは [Server 境界と read](references/server-boundary-and-reads.md) を、mutation、Server Function の入力と結果の型、外から来た値の schema を決めるときは [更新と外から来た値](references/mutations-and-inputs.md) を読む。state の形、URL と browser storage に置くもの、Effect を書きたくなったときは [状態と副作用](references/state-and-effects.md) を、Cookie、CSRF、CSP を決めるときは [ブラウザ側の防御](references/browser-defense.md) を読む。

## reference に無い判断

React Compiler を採用しているなら、Compiler を外す、対象を狭める、診断を黙らせる変更をしない。`memo`、`useMemo`、`useCallback` は予防的に足さず、外部 library が参照の同一性を求めるときか、計測で要ると分かったときだけ使い、理由をコードの近くに書く。

部品は、一つの利用者意図か一つの表示責務だけを持つ。表示、状態遷移、外部との入出力の変更理由が分かれるところで分け、各部品の責務を一文で言えたらそれ以上細かくしない。JSX や DOM に依らない判断は、表示から切り出して単体で確かめられる形にする。

部品、hook、型の名前は業務の資料の言葉で付ける（「借りている本の一覧」なら `BorrowedBookList`）。業務の概念を表す部品に、`DataTable`、`ItemCard`、`useFetchData` のような、形や技術から決めた名前を付けない。技術の言葉で名付けるのは、業務の概念を持たない部品（Error Boundary、schema の解析、通信の adapter など）だけである。

## 進め方と止まるとき

対象 repository の AGENTS.md、package.json、設定から、実行基盤、Server Function の API、認証の SDK、React Compiler の採否、完了判定の command を読む。任意の `references` は最初に読む。画面や操作ごとに、read の持ち主、Client にする葉、境界を越える値、Server Function の入力と結果型と認可、外から来る値の schema、状態の置き場を決めてから書き、完了判定の command を実行する。テストは `test-react-ui` に従う。

このskillはコードを変えるので、欠けた情報が実装を変えるときは推測で埋めずに止まり、何が分からないかと提案を返す。実行基盤が Server Components を使えるか読み取れない、認可の規則や業務の資料が曖昧、外から来る値の許される範囲が決まっていない、依頼が上の本質に反する、といったときである。

変更したファイル、画面と操作ごとに決めた設計、完了判定の結果、止まった点と提案を報告する。
