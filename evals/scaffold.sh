#!/usr/bin/env bash
# ケースが共有する準備。空の作業場所に、ケースの fixture を写した手元だけの git repository（out/）を作り、
# 依存を入れ、skill が名前で指す別 package の skill のファイルを harness/ へ写す。作業場所の agent は
# 外へ接続できないので、依存はこの script（作業場所の外の権限）が先に入れておく。
#
#   bash scaffold.sh <fixture のディレクトリ>
set -euo pipefail

[ $# -eq 1 ] || { echo "使い方: bash scaffold.sh <fixture のディレクトリ>" >&2; exit 2; }
FIXTURE=$(cd "$1" && pwd)
EVALS_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
WORKSPACE=$(cd "$EVALS_DIR/../.." && pwd)
DEVELOPMENT=$WORKSPACE/development-convention-plugins/plugins/development-convention/skills
TESTING=$WORKSPACE/testing-strategy-plugins/plugins/testing-strategy/skills

for skill in "$DEVELOPMENT/write-readable-code" "$DEVELOPMENT/apply-layer-convention" "$DEVELOPMENT/protect-entry-points" "$TESTING/design-test-strategy" "$TESTING/design-e2e-test-scenarios"; do
  [ -f "$skill/SKILL.md" ] || { echo "兄弟 checkout の skill が無い: $skill" >&2; exit 2; }
done

mkdir -p out harness
cp -R "$FIXTURE/." out/
for skill in "$DEVELOPMENT/write-readable-code" "$DEVELOPMENT/apply-layer-convention" "$DEVELOPMENT/protect-entry-points" "$TESTING/design-test-strategy" "$TESTING/design-e2e-test-scenarios"; do
  cp -R "$skill" "harness/$(basename "$skill")"
done
(cd out && npm ci --include=dev --silent --no-fund --no-audit && npx --no-install vitest --version >/dev/null)

git -C out init -q
git -C out add -A
git -C out -c user.name=eval -c user.email=eval@example.invalid commit -q -m "作業の前の状態"
