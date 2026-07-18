#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
elif [ -s "/usr/local/opt/nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "/usr/local/opt/nvm/nvm.sh"
else
  echo "[sol-log] nvm을 찾을 수 없습니다. Node 22가 필요합니다." >&2
  exit 1
fi

# 프로젝트 루트의 .nvmrc(22)를 사용
cd "$(dirname "$0")/.."
nvm use --silent >/dev/null

exec "$@"
