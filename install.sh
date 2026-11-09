#!/usr/bin/env bash
# Copy the ui-stress-test skill into Claude Code and/or Codex.
# Usage: ./install.sh [claude|codex|both]   (default: claude)
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)/skills/ui-stress-test"
target="${1:-claude}"
install_to() { mkdir -p "$1"; rm -rf "$1/ui-stress-test"; cp -R "$SRC" "$1/"; echo "Installed to $1/ui-stress-test"; }
case "$target" in
  claude) install_to "${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}" ;;
  codex)  install_to "${CODEX_SKILLS_DIR:-$HOME/.codex/skills}" ;;
  both)   install_to "${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"; install_to "${CODEX_SKILLS_DIR:-$HOME/.codex/skills}" ;;
  *) echo "Usage: $0 [claude|codex|both]"; exit 1 ;;
esac
