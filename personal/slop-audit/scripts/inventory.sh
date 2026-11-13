#!/usr/bin/env bash
# Source inventory per area: files and LOC. Respects .gitignore (git ls-files).
# Usage: inventory.sh [paths...]
set -uo pipefail
root=$(git rev-parse --show-toplevel) || exit 1
cd "$root"

src='\.(ts|tsx|js|jsx|mjs|cjs|vue|svelte|astro|py|go|rb|php|java|kt|kts|swift|rs|cs|sql|css|scss)$'
skip='(^|/)(node_modules|dist|build|out|coverage|\.next|\.nuxt|\.turbo|\.review|vendor|generated|__generated__|migrations/.*\.sql$)|\.min\.|\.d\.ts$|(^|/)(pnpm-lock|package-lock|yarn)\b'

files=$(git ls-files -- "$@" | grep -E "$src" | grep -Ev "$skip")
[ -z "$files" ] && { echo "no source files"; exit 0; }

area_of() {
  case "$1" in
    apps/*/*|packages/*/*|services/*/*|libs/*/*) echo "$1" | cut -d/ -f1-2 ;;
    */*) echo "$1" | cut -d/ -f1 ;;
    *) echo "(root)" ;;
  esac
}

printf '%s\n' "$files" | while read -r f; do
  printf '%s\t%s\n' "$(area_of "$f")" "$(wc -l <"$f" | tr -d ' ')"
done | awk -F'\t' '{n[$1]++; l[$1]+=$2; tf++; tl+=$2}
  END {printf "%-40s %7s %9s\n", "AREA", "FILES", "LOC";
       for (a in n) printf "%-40s %7d %9d\n", a, n[a], l[a] | "sort -k3 -nr";
       close("sort -k3 -nr");
       printf "%-40s %7d %9d\n", "TOTAL", tf, tl}'

echo
echo "LARGEST FILES"
printf '%s\n' "$files" | while read -r f; do printf '%6d %s\n' "$(wc -l <"$f" | tr -d ' ')" "$f"; done | sort -nr | head -20
