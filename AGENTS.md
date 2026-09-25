> 共通の規約は /Users/naoya-nakamoriq/Documents/Github/harness-pluginsv2/AGENTS.md にある。ここには、この repository だけの規則を置く。

# AGENTS.md

このrepositoryは、React 19のフロントエンドを実装し、テストする規約を配布する単一marketplaceである。marketplaceへ公開するインストール対象はpackage `react-convention`（`./plugins/react-convention`）だけで、公開入口は `skills/implement-react-boundary`（画面のread、mutation、Client部品を実装する）と `skills/test-react-ui`（振る舞いを検証層へ割り当ててテストする）の二つである。内部skillとplaybookは置かない。

規約は、秘密と認可をServerの内側に閉じること、Server Functionを独立した入口として扱うこと、外から来た値を丸めないこと、描画を純粋に保つこと、一つの振る舞いを一つの層で確かめ自分のコードを差し替えないこと、から導く。特定の実行基盤（TanStack Start、Next.jsなど）、道具（Vitest、Storybook、Playwright、MSW）、案件の値は、判断例と `references` の中にだけ置き、既定値にしない。React Server Componentsを使えない構成でも、当てはまる節は使えるように書く。

リポジトリ全体のテスト戦略とE2Eシナリオの設計は、このpackageの持ち物ではない。テストで差し替えてよい境界の言語に依らない原則は testing-strategy の `design-test-strategy` が持ち、このpackageは差し替えの仕組みだけを持つ。
