# 状態と副作用

stateの形を決めるとき、URLやbrowser storageに何を置くか決めるとき、Effectを書きたくなったときに読む。

## stateは事実を一つだけ持つ

props、既存のstate、readの結果から計算できる値は、stateに置かず描画中に導出する。導出できる値をstateへ写すと、二つの正が生まれ、更新の順序しだいで食い違う。同じ事実を複数のstateやネストした値に重ねて持たない。矛盾しうる複数のboolean（`isLoading` と `isError` と `isDone`）は、意味のあるunion（`"idle" | "submitting" | "done" | "failed"`）にまとめる。一緒に更新するstateは一つの単位で扱い、複数の操作と失敗を持つ状態遷移はreducerに閉じる。遷移の判断は、表示から切り出した純粋な関数にすると、単体で確かめられる。

## URLに置くもの、置かないもの

再読込、共有、戻る操作で再現すべき状態はURLに置く。検索語、filter、並び順、pageがそうである。未保存の下書き、dialogの開閉、一時的な選択、読み込み済みの範囲は置かない。

URLの値の解釈、許される値、依存するparameterのreset（filterを変えたらpageを戻すなど）は、readの持ち主が一つのschemaで一度だけ行う。値が無いか既定値を補うときの遷移は履歴を増やさない `replace` にし、利用者が確定した検索やpageの変更は `push` にする。一度だけ表示する通知のparameter（`?notice=extended` など）は、表示した後に同じ画面の正規のURLへ `replace` する。

## browser storageは最後の手段

URL、Serverのread、局所のstateで表せる値を、browser storageへ写さない。保存してよいのは、下書き、利用者が明示した表示の設定、接続が切れても残したい一時の入力だけである。保存するときは、最小のJSONにschemaの版を含め、利用者や所属に属する値はそのscopeをkeyに含める。秘密、token、認可の根拠、個人情報は保存しない。読み出した値は、外から来た値としてschemaに通す。

## Effectの前に試す順

Effectは、外部システムとの同期だけに使う。Effectが要りそうに見えたら、次の順に代わりを試す。描画中の導出、event handler、stateの形の整理、keyによる再マウント（入力の単位が変わったときの局所stateの初期化）、親での所有、外部storeの購読API、readの持ち主の再検証の仕組み。どれでも表せない外部との同期だけをEffectに書き、依存と後片付けを正しく書く。依存配列を偽ったり、lintを抑えたりして挙動を固定しない。Effectから最新の値を読むだけの処理は、React 19の `useEffectEvent` で依存から分ける。

## 判断例（図書館の貸出）

蔵書の検索画面で、検索語と「貸出可能だけ」のfilterはURLに置く。filterを変えたらpageは一ページ目に戻る。この依存はURLのschemaが持つ。検索語の入力欄の途中の文字は、確定するまでURLに入れない。「延滞している本の数」は、貸出の一覧から描画中に数える。stateに写すと、本を返した後に数がずれる。
