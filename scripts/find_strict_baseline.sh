#!/usr/bin/env bash
set -euo pipefail

APP_DIR="apps/web"
OUT="/tmp/strict_baselines.csv"

# Pick candidate refs: prioritise likely “strict/green/prod” names + main heads
mapfile -t CANDIDATES < <( 
  git for-each-ref --format='%(refname:short)' refs/heads/ refs/remotes/ \
  | grep -E 'strict|green|prod|stable|main|master|release' -i \
  | sort -u \
)

# Fallback: if nothing matched, just take the latest 10 local heads
if [ ${#CANDIDATES[@]} -eq 0 ]; then
  mapfile -t CANDIDATES < <(git for-each-ref --format='%(refname:short)' refs/heads/ | head -n 10)
fi

echo "ref,ts_errors,eslint_errors" > "$OUT"

for ref in "${CANDIDATES[@]}"; do
  echo "→ Checking $ref" >&2
  git checkout -q "$ref"

  # TS error count
  TSERR=$(pnpm -C "$APP_DIR" tsc --noEmit 2>&1 | grep -c "error TS" || true)

  # ESLint error count (JSON format → count severity===2)
  ESLJSON="/tmp/eslint_report.json"
  pnpm -C "$APP_DIR" eslint src -f json -o "$ESLJSON" >/dev/null 2>&1 || true
  ESLERR=$(node -e "try{const r=require('$ESLJSON');let c=0;r.forEach(f=>f.messages?.forEach(m=>{if(m.severity===2) c++}));console.log(c)}catch(e){console.log(0)}")

  echo "$ref,$TSERR,$ESLERR" | tee -a "$OUT" >/dev/null
done

# Show best candidates
echo
echo "Best candidates (lowest errors first):"
sort -t, -k2,2n -k3,3n "$OUT" | column -s, -t
