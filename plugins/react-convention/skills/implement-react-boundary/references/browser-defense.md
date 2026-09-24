# ブラウザ側の防御

認証の方式、Cookie、外部のscriptやstyleの読み込みを決めるときに読む。ブラウザを相手にしない（APIだけを提供する）systemには当たらない。

## 偽装要求（CSRF）

認証がCookieで自動送信されるなら、状態を変えるすべての入口（Server FunctionのPOST、formの送信先、状態を変えるHTTPの入口）に、偽装要求への対策を置く。他のsiteのページから送られた要求にも、ブラウザはCookieを付けてしまうからである。対策は実行基盤が用意する仕組み（originの照合、tokenの照合など）を使い、適用する範囲を状態を変える入口に揃える。認証がBearer headerだけで、Cookieを使わないなら、ブラウザが自動で付けないので必要性は下がる。その場合は、外す理由を書いてから外す。

## Cookie

Cookieは、scriptから読めないこと（httpOnly）、暗号化された通信だけで送ること（Secure）、他のsiteからの要求に付けないこと（SameSite）、寿命を最短にすることを既定にする。外す属性があれば、属性ごとに理由を書く。一度しか使わない値（外部の認証から戻るまでの登録の意思など）は、分単位の寿命にする。

## Content Security Policy

読み込んでよいscript、style、画像、接続先のoriginを列挙する。認証のSDKや解析のscriptのように外部から読み込むものは、そのoriginだけを許す。`unsafe-inline` や `unsafe-eval` を使うなら、どのdirectiveで、なぜ要るかを書く。

## セキュリティのheader

frameに埋め込ませない、MIMEの推測をさせない、referrerを必要な範囲に絞る、といったheaderを、すべての応答に付ける。

## 判断例（図書館の貸出）

図書館のsiteは、外部の認証サービスのCookieで利用者を認証する。貸出の延長と返却の予約は状態を変えるので、そのServer FunctionにはCSRFの対策を置く。一覧を読むGETには置かない。外部の認証から戻るまで「新規登録の途中である」ことを覚えるCookieは、httpOnly、Secure、SameSite=Lax、十分間にする。CSPのscriptのoriginには、自分のsiteと認証サービスのoriginだけを並べる。
