---
name: implement-react-boundary
description: React 19のフロントエンドで、画面のread、mutation、Client部品を、秘密と認可をServerの内側に閉じ、Server Functionを独立した入口として扱い、外から来た値を丸めない形で実装する・直す。「この画面を実装して」「このmutationをServer FunctionとActionで書いて」「この部品をClientにするべきか決めて直して」と言われたときに使う。テストを書くことは `test-react-ui`、リポジトリ全体のテスト戦略は repository の決定へ返す。
---

# implement-react-boundary

読み終えたagentは、React 19の画面、Server Function、Client部品を、どこで何を実行し、境界を何が越えるかを決めたうえで実装できる。実行基盤（TanStack Start、Next.jsなど）が違っても、同じ判断で書ける。

## 本質

この規約の大半は、次の四つから導かれる。

秘密と認可はServerの内側に閉じる。ブラウザへ渡すのは、認可済みで直列化できる値（DTO、ID、有限の状態）と、Server Functionの参照だけである。ブラウザに届いた値は、表示のための写しであって、次の操作を許す証拠にはならない。

Server Functionは、画面から呼ばれる関数である前に、外から直接叩ける独立したHTTPの入口である。だから、入力の検証、認証、認可を関数の内側で毎回行い、画面のroute guardを認可の根拠にしない。

外から来た値（URL、form、外部の応答、browser storage）は、期待する型でなければ既定値へ丸めず、利用者に見える失敗にする。黙って丸めると、壊れた入力が正しい操作に化け、誰も気付かない。

描画は純粋に保つ。描画中にpropsやstateを変えず、副作用を持ち込まない。React Compilerの自動メモ化も、この純粋さを前提にしている。

## 入力

対象repositoryの絶対pathと、実装または修正する画面・操作・部品の依頼を受け取る。任意の `references` は追加で従う資料の絶対path配列で、最初に読む。実行基盤がReact Server Componentsを使えるか、Server FunctionのAPI（`createServerFn`、`'use server'` など）、認証のSDK、React Compilerを採用しているか、repositoryの完了判定のcommandは、対象repositoryのAGENTS.md、package.json、設定fileから読む。

## 判断基準

### 実行基盤で適用する範囲が変わるか

React Server Componentsを使える実行基盤なら、すべての節を当てる。使えない構成（ViteとReactだけのSPAなど）なら、Server Functionに相当するHTTPの入口、外から来た値、Client部品、状態、副作用、ブラウザ側の防御の節だけを当て、「表示はServer Componentが持つ」を課さない。どちらか読み取れなければ、推測で決めずに止まる。

### readを誰が持つか

初期表示のreadは、Server Componentが持つことを既定にする。Client部品がreadを持つのは、queryの入力がブラウザにしか無いとき（browser storageの値など）か、表示中に同じresourceを取り直し続けることが要求のとき（他者の変更の反映、複数ページの保持、応答前に重なる楽観的な更新）だけである。一つのreadの持ち主は、初期表示から更新後の再描画まで一つにする。持ち主を途中で替えると、二つのcacheが同じ事実を別々に持つ。独立したreadは逐次awaitせず、意味のあるSectionに分けて並行に始め、待機の境界と失敗の境界をSectionごとに置く。詳しくは [Server境界とread](references/server-boundary-and-reads.md) に従う。

### Clientにする範囲はどこまでか

Clientにするのは、利用者のevent、ブラウザAPI、state、Contextの購読が要る最小の葉だけである。Client部品を子に持つことは、親をClientにする理由にならない。Server Componentは、Client部品の子として渡せば、Serverで実行された結果として描かれる。表示だけを担う部品は、SDK、Server Function、通信のclient、ブラウザAPIを直接参照せず、表示に要る有限の状態とDTOと操作のcallbackだけをpropsで受ける。

### 更新をどう書くか

mutationは、formで表せるなら `<form action>` からPOSTのServer Functionへ渡し、結果を `useActionState`、送信中を `useFormStatus` で受ける。formで表せない操作だけを、`useTransition` とClientのstateで書く。Server Functionは、入力の検証、認証、認可、更新、失敗の翻訳、遷移先の決定までを内側で終える。readのServer Function（GET）では状態を変えない。結果は判別できる有限の型（成功と、予測できる失敗の種類）で返し、想定外の失敗はthrowして境界に受けさせる。詳しくは [更新と外から来た値](references/mutations-and-inputs.md) に従う。

### 外から来た値が期待と違うとき

URLのparameter、formの値、外部の応答、browser storageの値は、入口で一つのschemaに通してから使う。値が無いことが仕様で決まっていれば、その既定値を使う。値があるのに型や範囲が合わなければ、既定値へ丸めずに、利用者に見える失敗（400相当の応答、入力のエラー表示、判別できる結果型の失敗）にする。結果型の未知の状態を、成功や既定の表示へ丸めない。

### 状態と副作用をどこに置くか

props、state、readの結果から計算できる値はstateに置かず、描画中に導出する。矛盾しうる複数のbooleanは意味のあるunionにまとめる。再読込、共有、戻る操作で再現すべき状態（検索語、filter、page）はURLに置き、下書きや開閉のような一時の状態は置かない。Effectは外部システムとの同期だけに使い、派生値、利用者操作の処理、readの通常経路には使わない。詳しくは [状態と副作用](references/state-and-effects.md) に従う。

### React Compilerを採用しているとき

Compilerを外す変更、対象を狭める変更、診断を黙らせる変更をしない。lintはCompilerが最適化を見送る原因もerrorとして扱う。`memo`、`useMemo`、`useCallback` を予防的に足さず、外部libraryが参照の同一性を契約として求めるときか、計測で必要と分かったときだけ使い、その理由をコードの近くに書く。

### ブラウザ側の防御は要るか

認証がCookieで自動送信されるなら、状態を変える入口に偽装要求（CSRF）への対策を置く。Cookieは、スクリプトから読めず（httpOnly）、送信範囲（SameSite）と寿命を最小にする。読み込む外部originはContent Security Policyで列挙する。詳しくは [ブラウザ側の防御](references/browser-defense.md) に従う。

### 部品の責務はどこで分けるか

一つの部品は、一つの利用者意図か、一つの表示責務だけを持つ。表示、状態遷移、外部との入出力の変更理由が分かれる場所で分け、分けた後に各部品の責務を一文で言えたら、それ以上細かくしない。JSXやDOMに依らず同じ入力から同じ結果を返す判断は、表示から切り出して単体で検証できる形にする。

### 名前とコメントを何の言葉で書くか

部品、関数、hook、型の名前は、業務の言葉で付ける。付けようとする名前が業務の資料の用語にある言葉かをまず確かめ、あればその言葉を使う（「借りている本の一覧」なら `BorrowedBookList`）。業務の資料の用語に無いなら、それが業務の概念を持たない技術の部品（Error Boundary、schemaの解析、通信のadapterなど）かを確かめ、そうであるときだけ技術の言葉で名付ける。業務の概念を表す部品に、`DataTable`、`ItemCard`、`useFetchData` のような、形や技術から決めた名前を付けない。名前が業務の言葉でないと、読み手は部品が何を担うかを実装から推し量ることになり、業務の資料との対応も追えなくなるからである。

コメントは、その部品や関数自身の目的と責務だけを、業務の言葉で書く。使う側の都合や、別の場所の部品の名前には触れない。名前やシグネチャを言い換えただけのコメントは書かない。外部から来る値（URLのparameter、外部サービスの識別子など）を持つ箇所には、実際に来る値の例を一つ添える。説明を長くするより、例一つのほうが伝わるからである。

## 手順

1. **実行基盤と規約を読む。** `references` と、対象repositoryのAGENTS.md、package.json、設定を読み、上の「入力」に挙げた事実を確かめる。[実行基盤ごとの判断例](references/framework-examples.md) で、その実行基盤での書き方を確かめる。
2. **設計を決める。** 画面や操作ごとに、readの持ち主、Clientにする葉、境界を越える値、Server Functionの入力・結果型・認可、外から来る値のschema、状態の置き場を決める。
3. **実装する。** 決めた設計のとおりに書く。テストはこのskillの対象外であり、`test-react-ui` に従って書く。
4. **検証する。** 対象repositoryの完了判定のcommandを実行する。

## 停止条件

このskillはコードを変えるので、分からない点に出会ったら推測で埋めずに止まり、何が分からないかと提案を返す。止まるのは、実行基盤がServer Componentsを使えるかを読み取れないとき、認可の規則や業務の資料が曖昧なとき、外から来る値の許される範囲が決まっていないとき、依頼がこの規約の本質（秘密をブラウザへ渡す、Server Functionの外で認可するなど）に反するとき、完了判定のcommandが失敗して直せないときである。

## 出力

変更したfile、画面と操作ごとの設計（readの持ち主、Clientにした葉と理由、境界を越える値、Server Functionの入力と結果型と認可、外から来る値のschema）、実行した完了判定の結果、止まった点と提案を報告する。
