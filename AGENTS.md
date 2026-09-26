> 共通の規約は /Users/naoya-nakamoriq/Documents/Github/harness-pluginsv2/AGENTS.md にある。ここには、この repository だけの規則を置く。

# AGENTS.md

このrepositoryは、React 19のフロントエンドの画面と操作を実装し、テストする規約を配布する単一marketplaceである。marketplaceへ公開するインストール対象はpackage `react-convention`（`./plugins/react-convention`）だけで、公開入口は `skills/develop-react-frontend` の一つである。内部skillは置かない。

規約はReactとしての判断だけを持ち、特定の実行基盤（TanStack Start、Next.jsなど）、道具、案件の値を既定にしない。ほかのpluginが持つ判断は書き直さず、名前で指す。名前、コメント、テストのために実装を曲げないことは development-convention の `write-readable-code`、入口の保護の宣言は development-convention の `protect-entry-points`、差し替えてよい境界とテストの層の原則は testing-strategy の `design-test-strategy`、E2Eに残す経路は testing-strategy の `design-e2e-test-scenarios` が持つ。
