# 実行基盤ごとの判断例

判断は実行基盤に依らない。この資料は、同じ判断を主な実行基盤でどう書くかの例である。対象repositoryの実行基盤がここに無くても、判断そのものは変わらない。APIの名前は版によって変わるので、実装の前に対象repositoryが使う版の公式の資料で確かめる。

## TanStack Start

Server Functionは `createServerFn` で書き、readは `method: "GET"`、mutationは `method: "POST"` を明示し、外部入力には必ずvalidatorを置く。routeの初期表示は、route loaderがGETのServer Functionを呼び、Server FunctionがServer Componentを描いて返す形にする。表示データを受け取るためだけに、routeのcomponentをClientにしない。

偽装要求の対策は、Server Functionへの要求に限って当てるmiddlewareで置く。routerがsearch parameterを数値として解釈することがあるので、schemaはrouterが渡す形を受けて検証する（文字列を期待して、それ以外を未指定とみなす書き方をしない）。

React Server Componentsの実装に使うAPIは、Reactのminorの更新でも変わりうるので、React、TanStack Start、RSCのpluginの版を固定する。Server Functionの一覧（manifest）がbuildで生成されるなら、完了判定の中でその一覧を検証する。

## Next.js

Server Functionは `'use server'` で宣言する。`'use server'` はServer Functionを宣言する記法であって、ブラウザ向けのbundleの境界ではない。Server Functionにしたからといって、ブラウザへ渡せる値は増えない。`'use client'` を置いたmoduleが、Client部品の境界を作る。

cacheの境界（`'use cache'`）の内側では、cookieやheaderのようなrequest時の値を読めないので、認可もその内側では行えない。request時の値は境界の外で読み、引数で渡す。Suspenseは、静的に描ける部分と、request時に流し込む部分の境目を作るだけで、routeを静的に戻す仕組みではない。

## React Server Componentsを使わないSPA

ViteとReactだけの構成では、readもmutationもブラウザからHTTPの入口を呼ぶ。この場合も、HTTPの入口はServer Functionと同じく独立した入口として、入力の検証、認証、認可を内側で行う。ブラウザへ渡す値、外から来た値、状態、副作用、ブラウザ側の防御の判断はそのまま当てる。「表示はServer Componentが持つ」は当てない。
