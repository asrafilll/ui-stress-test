#!/usr/bin/env bash
# Most-changed source files (commits touching each) — slop in hot files costs most.
# Usage: churn.sh [since, default "6 months ago"] [limit, default 40]
set -uo pipefail
root=$(git rev-parse --show-toplevel) || exit 1
cd "$root"
since="${1:-6 months ago}"
limit="${2:-40}"
echo "CHURN since $since (commits per file)"
git log --since="$since" --no-merges --format= --name-only \
  | grep -E '\.(ts|tsx|js|jsx|mjs|vue|svelte|astro|py|go|rb|php|java|kt|swift|rs|cs)$' \
  | grep -Ev '(^|/)(node_modules|dist|build|generated)/' \
  | sort | uniq -c | sort -nr | head -n "$limit"
