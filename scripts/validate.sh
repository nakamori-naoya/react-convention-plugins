#!/usr/bin/env bash
# Scenario: react-convention marketplaceがpackage 1件・公開入口2件で自己完結する。
# 機械検査は宣言と実体の対応だけを判定する。規約の内容が目的に適うかは意味評価として残す。
set -uo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
failed=0
PACKAGE="$ROOT/plugins/react-convention"

TOOLS="$ROOT/../harness-tools/tools"
[ -d "$TOOLS" ] || { echo "[error] 兄弟 checkout harness-tools が無い: $TOOLS" >&2; exit 2; }

python3 "$TOOLS/validate-plugin-repository.py" "$ROOT" || failed=1
python3 "$TOOLS/validate-plugin-repository.py" --self-test || failed=1
python3 "$TOOLS/test-hardening.py" --repository "$ROOT" || failed=1

# 期待versionはmanifestから導き、両marketplaceと両manifestが同じ値を持つことを確かめる。
version=$(jq -r '.version' "$PACKAGE/.claude-plugin/plugin.json")
expected_skills='["./skills/implement-react-boundary","./skills/test-react-ui"]'
for runtime in claude codex; do
  jq -e --arg version "$version" --argjson skills "$expected_skills" '
    .name=="react-convention" and .version==$version and .skills==$skills and
    .metadata.harness=={"marketplace":"react-convention","contractVersion":1}
  ' "$PACKAGE/.${runtime}-plugin/plugin.json" >/dev/null || { echo "[error] $runtime manifest" >&2; failed=1; }
done
for marketplace in "$ROOT/.claude-plugin/marketplace.json" "$ROOT/.agents/plugins/marketplace.json"; do
  jq -e --arg version "$version" '.name=="react-convention" and (.plugins|length)==1 and .plugins[0].name=="react-convention" and .plugins[0].version==$version' "$marketplace" >/dev/null \
    || { echo "[error] marketplace $marketplace" >&2; failed=1; }
done
diff <(jq -S 'del(.interface)' "$PACKAGE/.claude-plugin/plugin.json") <(jq -S 'del(.interface)' "$PACKAGE/.codex-plugin/plugin.json") >/dev/null \
  || { echo "[error] 両runtime manifestが interface 以外で異なる" >&2; failed=1; }

# 入口の構成: SKILL.md から references への link がすべて実在し、references の file がすべて SKILL.md から到達できる。
for entry in implement-react-boundary test-react-ui; do
  python3 - "$PACKAGE/skills/$entry" <<'PY' || failed=1
import re, sys
from pathlib import Path
root = Path(sys.argv[1])
skill = (root / "SKILL.md").read_text()
links = sorted(set(re.findall(r"\]\((references/[^)]+\.md)\)", skill)))
existing = sorted(str(p.relative_to(root)) for p in (root / "references").glob("*.md"))
missing = [link for link in links if not (root / link).is_file()]
unreached = [path for path in existing if path not in links]
if missing or unreached:
    print(f"[error] {root.name}: missing={missing} unreached={unreached}", file=sys.stderr)
    sys.exit(1)
PY
done

jq -e '.schema==1 and (.cases|length)>=4 and ([.cases[].id]|length)==([.cases[].id]|unique|length)' "$ROOT/evals/scenarios.json" >/dev/null \
  || { echo "[error] evals/scenarios.json" >&2; failed=1; }

while IFS= read -r script; do
  bash -n "$script" || failed=1
done < <(find "$ROOT" -type f -name '*.sh' -not -path '*/.git/*' | sort)

if [ "$failed" -eq 0 ]; then
  echo 'Validation: passed'
else
  echo 'Validation: failed'
fi
exit "$failed"
