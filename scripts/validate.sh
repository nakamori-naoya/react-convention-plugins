#!/usr/bin/env bash
# Scenario: react-convention marketplaceがpackage 1件・公開入口2件で自己完結する。
# 機械検査は宣言と実体の対応だけを判定する。規約の内容が目的に適うかは意味評価として残す。
set -uo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
failed=0

TOOLS="$ROOT/../harness-tools/tools"
[ -d "$TOOLS" ] || { echo "[error] 兄弟 checkout harness-tools が無い: $TOOLS" >&2; exit 2; }

python3 "$TOOLS/validate-plugin-repository.py" "$ROOT" || failed=1
python3 "$TOOLS/validate-plugin-repository.py" --self-test || failed=1
python3 "$TOOLS/test-hardening.py" --repository "$ROOT" || failed=1


while IFS= read -r script; do
  bash -n "$script" || failed=1
done < <(find "$ROOT" -type f -name '*.sh' -not -path '*/.git/*' | sort)

if [ "$failed" -eq 0 ]; then
  echo 'Validation: passed'
else
  echo 'Validation: failed'
fi
exit "$failed"
