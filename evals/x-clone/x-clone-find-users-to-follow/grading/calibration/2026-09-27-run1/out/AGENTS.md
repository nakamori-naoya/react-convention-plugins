# X のクローンの画面

React 19 の SPA である。Server Components と Server Function は使わず、画面はブラウザから backend の HTTP API を、認証サービスのトークン付きで呼ぶ。backend は別の配備単位で、契約は `docs/api.md` にある。業務の資料は `docs/<業務>/` にある。

テストは Vitest と Testing Library（jsdom）で書き、backend は MSW で差し替える。Storybook と E2E はまだ無い。完了判定は `npm run typecheck && npm test` である。
