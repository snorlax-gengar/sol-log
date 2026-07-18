#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

major="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)"

# CI/Vercel 등: 이미 Node 22+면 nvm 없이 바로 실행
if [ "$major" -ge 22 ] 2>/dev/null; then
  exec "$@"
fi

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
elif [ -s "/usr/local/opt/nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "/usr/local/opt/nvm/nvm.sh"
else
  echo "[sol-log] Node 22+가 필요합니다. (현재: $(node -v 2>/dev/null || echo unknown))" >&2
  echo "[sol-log] 로컬에서는 'nvm use' 후 다시 실행하세요." >&2
  exit 1
fi

nvm use --silent >/dev/null
exec "$@"
