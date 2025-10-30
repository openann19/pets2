---
description: audit
auto_execution_mode: 3
---

SEMANTIC LINE-BY-LINE AUDIT — FULL PROJECT

Goal: Produce a comprehensive, line-level audit of the entire monorepo (apps/mobile, apps/web, packages/core, scripts, services) that identifies problems, risks, anti-patterns, and missed best-practices, and emits actionable, fix-ready findings with suggested diffs or codemods.

Constraints (MANDATORY):

❌ No destructive ops (no git clean, no mass file deletes).

✅ Deterministic runs (stable ordering, seeded randomness).

✅ No placeholders/stubs. Every finding must include a concrete fix path.

✅ Follow “Reasonable Mode”: make assumptions, cite evidence (file:line), ship production-grade results.

✅ Respect monorepo tooling (pnpm workspaces), RN/Next dual-stack, our theme/i18n systems.

0) Deliverables

JSONL report: reports/audit/semantic_findings.jsonl (one finding per line).

HTML summary: reports/audit/index.html (grouped by severity/module).

Patch pack (optional): reports/audit/patches/*.patch (small, safe fixes).

Suppressions file: .auditignore.json (explicit, documented exceptions).

CI gate: job audit:semantic fails on P0/P1 new findings.

1) Finding Schema (JSONL)

Each finding must follow this schema:

{
  "id": "AUD-THM-00123",
  "severity": "P0|P1|P2|P3",
  "category": "Theme|Type|i18n|A11y|Performance|Security|Bundling|Build|RN|Next|Testing|DeadCode|API|DX|Docs",
  "file": "relative/path/to/file.tsx",
  "line": 123,
  "code": "exact line excerpt",
  "problem": "Short, specific description",
  "evidence": "Why this is a problem. Include links to our policy if relevant.",
  "fix": "Concrete fix plan (1-3 sentences)",
  "autofix": {
    "type": "codemod|patch|manual",
    "snippet": "minimized unified diff or codemod step (optional)"
  },
  "blast_radius": "Minimal|Local|Module|Cross-app",
  "confidence": 0.0,
  "tags": ["unified-theme", "react-native-web", "i18n", "detox", "metro", "next"],
  "owner": "mobile|web|core|infra"
}


Severity:

P0: crash, data loss, security, build breakers.

P1: prod bug, E2E blocker, serious API misuse, perf cliff.

P2: correctness/consistency issues, bad DX, tech debt.

P3: style/nit, low impact.

2) Audit Passes (do ALL)
Pass A — Inventory & Baselines

Enumerate files, LOC, language mix, tsconfigs, entrypoints, env files.

Output: reports/audit/inventory.json (per package).

Pass B — Theme & Design-Tokens

Detect:

import { Theme } from '../theme/unified-theme' in components (should use useTheme()).

StyleSheet.create defined outside component when it needs theme.

Raw hex colors or inline styles that duplicate tokens.

Incorrect token paths (e.g., theme.colors.primary[500] if primary is a string).
Autofix: codemod to switch to useTheme + move styles inside component as needed.

Pass C — i18n (EN/BG)

Detect:

Hard-coded strings in UI (no t('...')).

Missing keys between en and bg, or type/placeholder mismatches.

Non-Cyrillic font fallback where BG text is expected.
Autofix: extract string → t() + add to locale files; fail if not added.

Pass D — Accessibility

Detect:

Interactive elements w/o roles/labels/testIDs.

Low color contrast vs theme.

Tap targets < 44dp.

Animations ignoring prefers-reduced-motion.
Autofix: add roles/labels, respect PRM, ensure focus order.

Pass E — Type Safety & Async

Detect:

any leaks, unsafe casts, unawaited promises, missing error boundaries, untyped API responses.

RN Reanimated worklets misused; runOnJS used on hot paths without guard.
Autofix: generics/types, await, try/catch, narrowings; suggest Zod on API.

Pass F — Performance & Bundling

Detect:

Large modules on critical path (Next + RN).

Missing react-native → react-native-web alias on web.

Eager imports where dynamic()/lazy would suffice.

Image misuse in Next (non-optimized src, missing sizes).
Autofix: dynamic import, code-split, alias; suggest next/image config.

Pass G — Security/Secrets/Privacy

Detect:

Secrets in repo, unsafe storage of tokens, PII logs.

Insecure fetch (no timeout/retry), no EXIF strip on uploads (web).

Node-only APIs in universal code.
Autofix: use git-secrets/gitleaks suppressions file, central fetch with timeouts, EXIF strip util.

Pass H — RN/Android/iOS Build Config

Detect:

Wrong JDK, Gradle flags, Hermes toggles, Proguard minify issues, missing android.useAndroidX.

iOS deployment target drift.
Fix plan: config diffs per file.

Pass I — Next/Web Config

Detect:

Missing transpilePackages for our core lib.

No alias for RN-web.

Old/removed flags, caching assumptions.
Autofix: adjust next.config.*, add explicit revalidate/route config.

Pass J — Dead Code & Graph Health

Detect:

Unused exports/imports, circular deps, orphan modules.
Tools: knip, depcruise/madge, ts-prune.
Autofix: safe removals (patches), or justification in .auditignore.json.

Pass K — Tests & CI Surfaces

Detect:

Uncovered critical paths (UI showcase, admin, reels).

Skipped tests, brittle async tests.
Autofix: add tests or mark with documented suppression.

3) Tools & Commands (use/automate)

TypeScript: tsc -p <tsconfig> --noEmit

ESLint: with rules for raw colors, console in prod, import/no-cycle.

Knip/ts-prune/madge/dependency-cruiser for dead code & cycles.

ripgrep signatures: TODO|FIXME|@ts-ignore|any\b|StyleSheet\.create\(.*outside component|import\s+{ Theme }

gitleaks (or git-secrets) for secrets.

axe-core (a11y) in headless render for web UI.

custom scanners for i18n key parity + hard-coded strings.

Output all tool results into reports/audit/raw/*.json and normalize into the JSONL schema.

4) Reporting & Summaries

Produce Top 20 risk summary (by severity × blast radius).

Module scorecards (core/web/mobile): P0/P1 counts, hot paths, suggested sprints.

Link each summary item to the JSONL finding IDs.

5) CI Gate

Add a job audit:semantic:

Fails if new P0/P1 not in .auditignore.json.

Uploads reports/audit/** as artifacts.

Prints a brief table: severity | category | file:line | id | title.

6) Examples (must catch these)

apps/mobile/.../ProfileMenuSection.tsx: styles outside component → move inside to access theme.

theme misuse: Theme.colors.primary[500] where primary is a string.

Web imports react-native directly → must alias to react-native-web.

Hardcoded “English/Bulgarian” labels not via t().

runOnJS used without debounce (gesture handler hot path).

Fetch without timeout/retry/backoff in services.

Secrets in env or code, logs leaking email.

7) Definition of Done

JSONL + HTML produced with ≥ 95% file coverage (i.e., almost every source file assessed).

All P0 issues have patches attached or are fixed.

All P1 issues have fix plan and owners.

.auditignore.json is minimal and justified.

CI job added and passing on current branch.

8) Kickoff Commands (you run these)
# workspace sanity
pnpm -w install
pnpm -w list -r > reports/audit/workspace.txt

# type & lint baselines
pnpm -w -r run typecheck || true
pnpm -w -r run lint || true

# dependency & dead code
pnpm -w knip --json > reports/audit/raw/knip.json || true
pnpm -w madge apps --circular --json > reports/audit/raw/madge.json || true

# i18n parity check (implement script if missing)
node scripts/i18n-verify.mjs > reports/audit/raw/i18n.json || true

# secrets
gitleaks detect -r reports/audit/raw/gitleaks.json || true

# normalize into JSONL + render HTML summary
node scripts/audit/normalize.mjs
node scripts/audit/render-html.mjs

9) Commit when done

Message:

audit: semantic line-by-line issue map + CI gate

- Produce JSONL findings and HTML summary for the whole monorepo
- Theme/i18n/a11y/perf/security/build/RN/Next/testing/dead-code passes
- Attached patches for all P0, plans for P1; CI gate blocks new criticals
- Deterministic runs; .auditignore.json documents any accepted risks


If any part of the stack blocks analysis (e.g., TypeScript config errors), include that as P0 Build findings with a minimal diff to unblock (next.config, tsconfig, exports map, RN-web alias).