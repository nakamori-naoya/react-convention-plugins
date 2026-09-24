# 更新と外から来た値

mutationを書くとき、Server Functionの入力と結果を決めるとき、URL・form・外部の応答の値を扱うときに読む。

## Server Functionは独立した入口である

Server Functionは、画面のbuttonから呼ばれる関数に見えるが、実際には外から直接叩けるHTTPの入口である。画面のroute guardを通らずに呼ばれることを前提に書く。そのため、関数の内側で、入力をschemaで検証し、sessionから主体を得て、その主体がこの操作をしてよいかを確かめてから更新する。業務上の最終的な認可はbackendのcommandが再び確かめるが、Server Functionはそれに頼らず自分の入口を守る。

readのServer Function（GET）では状態を変えない。GETは再試行や先読みで何度も呼ばれうるからである。登録、フォロー、logoutのように状態を変える処理は、必ずPOSTのServer Functionに置く。

名前は利用者の操作を表すものにする。引数はFormDataか、明示した型付きの値にし、ブラウザのtoken、通信のclient、UIに固有の型を持ち込まない。ファイルのダウンロードのようにHTTPの応答そのものが要る処理は、Server Functionではなく別のHTTPの入口にする。

## 結果は判別できる有限の型にする

Server Functionは、成功と、予測できる失敗の種類を判別できるunionで返す（`{ kind: "extended" }`、`{ kind: "rejected", reason: "overdue" }` のように）。表示側は、その種類を網羅して描き分ける。未知の種類を受けたら、成功や既定の表示へ丸めず、想定外の失敗として扱う。想定外の失敗（通信の断、壊れた応答）は結果の型へ詰めずにthrowし、Error Boundaryに受けさせる。未認証のredirectや存在しないresourceの応答は、Error Boundaryへ届く前に入口で返す。

## formで書けるものはformで書く

formで表せる操作は `<form action={serverFunction}>` と submit buttonで書き、結果を `useActionState`、送信中の表示を送信buttonの子の `useFormStatus` で受ける。click handlerと `useTransition` で独自のmutationの仕組みを作らない。Server Componentからformを描くだけなら、Clientにしなくてよい。

formで表せない操作（dialogからの直接の操作など）だけを、`useTransition` とClientのstateで書く。Server FunctionをActionから呼ぶ薄いClientのadapterは置いてよいが、adapterは入力の収集、送信中の表示、結果の反映だけを持ち、業務の判断やエラーの翻訳を持たない。

利用者の追加の操作なしにPOSTすること自体が要求である場合（外部の認証から戻った直後の登録など）だけ、最小のEffectからServer Functionを一度呼んでよい。Effectの中に、登録の判断、認可、通信の詳細を持ち込まない。

## 外から来た値を丸めない

URLのparameter、formの値、外部の応答、browser storageの値は、入口で一つのschemaに通す。schemaは、許される型、範囲、依存するparameter同士の関係を一か所で決める。

値が無いときに使う既定値が仕様で決まっていれば、それを使う。値があるのに型や範囲が合わないときは、既定値へ丸めない。URLなら400相当の応答か、利用者に見える誤りの表示にする。formなら、その入力に関連付けた誤りを返す。外部の応答なら、想定外の失敗としてthrowする。丸めると、壊れた入力が正しい操作に化け、原因が誰にも見えなくなる。

routerやframeworkが値を先に解釈することにも気を付ける。URLの `?cursor=123` をrouterが数値として解釈すると、文字列を期待したschemaでは型が合わなくなる。そのとき「文字列でなければ未指定とみなす」と書くと、先頭ページへ黙って丸めることになる。schemaの側で、routerが渡す形を受けたうえで検証する。

## 版と競合

保存の単位ごとに版（version）を持ち、下書きを始めた時点の版を控える。新しいreadの版が控えと違えば他者の変更であり、下書きを黙って上書きせず、取り込むかを利用者に選ばせる。二度実行すると結果が変わる操作（送付、課金、外部への通知）は、冪等のkeyを付けて送る。

## 判断例（図書館の貸出）

「貸出を延長する」は、延長のServer Function（POST）に置く。関数の内側で、sessionの利用者が貸出の借り手であるかを確かめ、延滞中なら `{ kind: "rejected", reason: "overdue" }`、上限回数なら `{ kind: "rejected", reason: "renewal_limit" }` を返す。表示側は二つの理由を別の文で示す。backendが知らない理由を返してきたら、「延長できませんでした」と丸めずにthrowし、Error Boundaryで扱う。

貸出の一覧のURLの `?page=abc` は、schemaで数値として検証し、合わなければ一ページ目へ黙って戻さず、誤ったページの指定であることを表示する。`page` が無いときは、仕様どおり一ページ目を表示する。
