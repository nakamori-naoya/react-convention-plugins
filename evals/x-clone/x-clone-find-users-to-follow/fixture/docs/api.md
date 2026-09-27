# backend の API（抜粋）

すべての要求に `Authorization: Bearer <トークン>` を付ける。トークンが無いか無効なら 401 を返す。

## GET /users/to-follow

フォローする相手を探す一覧の最初の部分を返す。

```json
{
  "users": [
    { "user_id": "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f01", "relation": "self" },
    { "user_id": "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f02", "relation": "following" },
    { "user_id": "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f03", "relation": "not_following" }
  ],
  "next_cursor": "0193a3c1-7a4e-7c2e-9f10-5b8d2e6a4f03"
}
```

`relation` は `self`、`following`、`not_following` のどれかである。一回に返す人数は20人で、`next_cursor` は続きが無ければ `null` になる。

## POST /follows

本文 `{ "followee_id": "<利用者ID>" }` で、トークンの利用者が相手をフォローする。

成功は 204。業務の規則で拒むときは 409 で、本文は `{ "message": "<業務知識の拒む理由の語>" }` である（例: `"フォロー上限に達している利用者がフォローする"`）。上限を超えた回数の要求には 429 を返す。
