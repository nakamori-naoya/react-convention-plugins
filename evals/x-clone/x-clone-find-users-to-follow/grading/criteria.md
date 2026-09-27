<!-- common: react-screen -->
<!-- document: out/package.json -->

# X のクローンのフォローする相手を探す画面に固有の条件

作業の前の repository には、backend をトークン付きで呼び、409 を業務の拒否、429 を利用上限として返す `src/api/client.ts` の `callBackend` と、利用者IDの schema の `src/user/user-id.ts` があった。業務知識は、一覧が利用者IDの小さい順で、一人ごとに本人、フォロー中、フォローしていないの区別を見せると決めている。backend の契約は、区別を `self`、`following`、`not_following` の三つで返すと決めている。

### relation-exhaustive

重み: 2

PASS：区別（本人、フォロー中、フォローしていない）を三つの値の union の型で持ち、backend の知らない値を throw している。フォローする操作は、フォローしていない相手にだけ出している。

FAIL：区別を string のまま持っているか、知らない値を既定の表示にしている。または、本人やフォロー中の相手にもフォローする操作を出している。

### reuse-backend-client

重み: 3

PASS：backend の呼び出しに作業の前からあった `callBackend` を使い、利用者IDの検証に `userIdSchema` を使っている。

FAIL：`fetch` を直接呼ぶ別の関数を書いているか、利用者IDの検証を別に書いている。
