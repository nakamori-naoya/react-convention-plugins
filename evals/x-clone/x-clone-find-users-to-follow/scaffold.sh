#!/usr/bin/env bash
# backend を呼ぶ関数と利用者IDの型を先に持つ SPA の repository を作る。
set -euo pipefail
CASE_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
exec bash "$CASE_DIR/../../scaffold.sh" "$CASE_DIR/fixture"
