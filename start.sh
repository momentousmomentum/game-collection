#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "Python 3 is required."
  exit 1
fi
if command -v open >/dev/null 2>&1; then
  open "http://127.0.0.1:5173" || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://127.0.0.1:5173" || true
fi
exec "$PY" server.py
