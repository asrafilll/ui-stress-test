#!/usr/bin/env bash
# Copy skills from personal/ and preferences/ into Claude Code and/or Codex.
# Usage:
#   ./install.sh --list
#   ./install.sh [--target claude|codex|both] all | personal | preferences | <skill> [<skill> ...]
# Default target: claude. Existing copies of the same skill are replaced.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
target=claude; picks=()
while [ $# -gt 0 ]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    --list) for g in personal preferences; do echo "$g:"; for d in "$ROOT/$g"/*/; do [ -f "$d/SKILL.md" ] && echo "  $(basename "$d")"; done; done; exit 0 ;;
    -h|--help) sed -n 2,6p "$0"; exit 0 ;;
    *) picks+=("$1"); shift ;;
  esac
done
[ ${#picks[@]} -eq 0 ] && { echo "Name skills to install, or: all | personal | preferences. See --list."; exit 1; }
dirs=()
for p in "${picks[@]}"; do
  case "$p" in
    all) for d in "$ROOT"/personal/*/ "$ROOT"/preferences/*/; do [ -f "$d/SKILL.md" ] && dirs+=("${d%/}"); done ;;
    personal|preferences) for d in "$ROOT/$p"/*/; do [ -f "$d/SKILL.md" ] && dirs+=("${d%/}"); done ;;
    *) if [ -f "$ROOT/personal/$p/SKILL.md" ]; then dirs+=("$ROOT/personal/$p")
       elif [ -f "$ROOT/preferences/$p/SKILL.md" ]; then dirs+=("$ROOT/preferences/$p")
       else echo "Unknown skill: $p (see --list)"; exit 1; fi ;;
  esac
done
install_to() { mkdir -p "$1"; for d in "${dirs[@]}"; do n=$(basename "$d"); rm -rf "${1:?}/$n"; cp -R "$d" "$1/"; echo "Installed $n -> $1/$n"; done; }
case "$target" in
  claude) install_to "${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}" ;;
  codex)  install_to "${CODEX_SKILLS_DIR:-$HOME/.codex/skills}" ;;
  both)   install_to "${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"; install_to "${CODEX_SKILLS_DIR:-$HOME/.codex/skills}" ;;
  *) echo "--target must be claude, codex or both"; exit 1 ;;
esac
echo "Restart your agent so it picks up the skills."
