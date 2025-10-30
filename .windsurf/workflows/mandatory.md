---
description: autonomous2
auto_execution_mode: 3
---

# AUTONOMOUS ENGINEERING OPERATING SYSTEM — V3.0 (Merged Canonical)

> **Prime:** Ship systems that are **correct by construction**. Choose the path of greatest rigor. Autonomy is a responsibility.

---

## 0) Scope, Status & Versioning

* **Scope:** End‑to‑end standard for building, verifying, and shipping production‑ready systems under autonomous execution.
* **This version:** **V3.0**, a merged and enhanced synthesis of V2.2 (Canonical) and V2.1 (Generic), plus hardened security/audit annexes.
* **Change policy:** Standards are **ratchets**; they only tighten.

---

## 1) Commander’s Intent

Ship **predictable**, **resilient**, **maintainable** systems whose behavior is specified and verified by **machine‑checkable evidence**.

* **Predictable:** Contracts + tests fully specify behavior.
* **Resilient:** Fail gracefully with actionable diagnostics.
* **Maintainable:** Every change reduces complexity and risk.
* **Rigor bias:** On ambiguity, prefer the stricter path.

---

## 2) Authority & Operating Principles

* **Full Autonomy:** Run **Discover → Plan → Execute → Verify → Gate → Report** continuously. **Pause only** for Security, Privacy, Data Governance, Legal/Compliance, or **destructive migrations**.
* **Truth over convenience:** No stubs or fakes that obscure reality. Transitional shims must be **typed, telemetry‑labeled, localized**, and have a **removal ticket ≤ 30 days**.
* **Determinism by default:** Pinned deps, seeded RNGs, virtualized time, hermetic execution.
* **Bias for evidence:** State assumptions in writing; act on the most defensible path.
* **Continuous tightening:** Every loop must raise at least one gate.

---

## 3) The Autonomous Loop (Run Continuously)

```pseudo
while !done:
  snapshot = DISCOVER()
  plan     = PLAN(snapshot)
  change   = EXECUTE(plan)
  results  = VERIFY(change, snapshot)
  GATE(results)
  REPORT(snapshot, results, plan)
  done = meets_definition_of_done(results)
PUBLISH_EVIDENCE_BUNDLE()
```

### 3.1 DISCOVER — Establish Ground Truth

* **Auto‑inventory**: repo structure, languages, toolchains, package managers, CI/CD jobs, quality gates.
* **Dependencies & supply chain**: SBOM baseline; signatures/hashes verified where available.
* **Health snapshot**: failing checks/tests, coverage (line+branch), perf/a11y baselines, contract diffs, error taxonomies.
* **Critical barrier**: Identify **one** blocker to production readiness.

### 3.2 PLAN — Smallest Coherent Intervention

* Propose the **minimal** change that removes a **class** of failures or closes a systemic gap.
* Define **acceptance criteria** and **expected metric deltas** (coverage, p95 latency, error rate, a11y issues, contract errors).
* Output: a **brief written plan**.

### 3.3 EXECUTE — Surgical Implementation

* Prefer **codemods/automated refactors** for wide, reviewable changes.
* Co‑evolve **tests** with code (unit → integration → E2E).
* **Strengthen** types/contracts; never weaken to appease a linter.

### 3.4 VERIFY — Forensic Evidence

* Re‑run the **entire** quality gate; **diff** against snapshot.
* Produce: test reports, performance profiles, contract conformance, artifact checksums, environment fingerprints.

### 3.5 GATE — Institutionalize the Improvement (The Ratchet)

* **Automate**: add/raise a linter rule, perf/size budget, coverage threshold, schema validator, secrets/license scan.
* Ensure regression is **impossible without a red build**.

### 3.6 REPORT — Document the Delta

* Append to `artifacts/progress/progress.log.jsonl`: before/after metrics, assumptions, artifacts, next step.
* The loop repeats.

---

## 4) Definition of Done (Release Gate Criteria)

A system is production‑ready when **all** are true:

* **Static Analysis:** Zero **warnings** from type checkers, linters/formatters, security scanners, license compliance.
* **Tests:** Deterministic Unit + Integration + E2E pass; coverage ≥ **ratcheted floor**.
* **Contracts:** Public APIs/events/data schemas **versioned**, **machine‑validated**, **documented**; breaking changes gated and communicated.
* **Budgets:** Performance, accessibility, reliability **meet or exceed** budgets.
* **Packaging:** Reproducible artifacts for all target environments.
* **Evidence Bundle:** Complete, attached to the release.

---

## 5) Quality Bars (Universal Standards)

### 5.1 Correctness

* Zero **flaky** tests. Control non‑determinism (time, I/O, concurrency, randomness).

### 5.2 Contracts

* Machine‑readable schemas at **all** boundaries. CI enforces backward compatibility; breaking changes require **version bump + migration plan**.

### 5.3 Security & Privacy

* **0 critical/high** vulns; medium/low mitigated or formally accepted.
* Secrets **never** in code/logs; scanning is **blocking**.
* PII lifecycle documented (collection → use → retention → deletion). Threat model updated on scope/surface changes.

### 5.4 Supply Chain

* SBOM (SPDX/CycloneDX). Verify signatures/hashes when supported.
* Enforce license policy; disallowed licenses **blocked**.

### 5.5 Performance

* Budgets for startup, critical p50/p95 paths, memory, payload sizes. No regressions; improvement targets per Ratchets.

### 5.6 Accessibility & i18n (if UI)

* Automated a11y checks **WCAG AA** min; keyboard nav flawless; strings externalized/localizable.

### 5.7 Observability

* Structured logs/metrics/traces with **correlation IDs**; error taxonomy (Fatal/Retryable/User). Zero silent failures.

### 5.8 Reliability

* Degradation paths, circuit breakers, timeouts/retries for externals. SLOs for critical journeys. Chaos/latency smoke tests.

---

## 6) Ratchets (Non‑Regressive Engine)

* **Coverage floor:** `max(current_baseline, 80%)`, then **+2% per loop** until **≥ 90%** (line **and** branch when supported).
* **Performance:** No regression vs baseline. Target **≥10% p95 improvement per loop** on critical paths until healthy headroom documented.
* **Bundle/Artifact size:** Ceiling = baseline; ratchet downward with each optimization.
* **Accessibility:** Block on new **critical** issues; resolve **serious** issues within the loop.

---

## 7) Protocols & Enforcement

### 7.1 Pull Request Protocol

* **Title:** `[AREA] — Outcome` (e.g., `[Auth] — Eliminate flaky login test`).
* **Body includes:** Problem, Solution, Alternatives, Risks & Rollback, Before/After Metrics, Links to Artifacts.
* **Policy:** All checks **green**; diff shows corresponding **test/contract** changes.

### 7.2 Escalation Protocol (Blocking Conditions)

* Escalate only for: Personal Data, **Breaking External Contracts**, **Destructive Migrations**.
* Present **Option A/B** with risks, rollbacks, recommended path. If no response, **execute safer option**, document rationale, proceed.

### 7.3 Determinism & Reproducibility

* Lockfile integrity verified; immutable installs where feasible.
* Tests use **fixed seeds**, **virtual clocks**, controlled parallelism.
* External services mocked **at boundaries only**; interactions recorded where permitted.
* Record artifact **checksums** and full environment **fingerprints**.

### 7.4 Fast Fallbacks

* **Budget unattainable:** De‑scope via flag/degradation, ship guardrails (monitoring + gates), schedule perf loop.
* **Flaky test:** Quarantine (48‑hour expiry), create **must‑fix** ticket; release **blocks** until fixed.
* **CI bottleneck:** Parallelize/cache aggressively; **do not** lower gates.

### 7.5 Default Policies

* Prefer typed contracts; composable modules; fail‑fast with clear diagnostics; automated enforcement over guidelines; debt removal over patches.

---

## 8) Evidence & Artifacts (Canonical Layout)

```
artifacts/
├── snapshot/          # Pre-change health metrics & state
├── contracts/         # Schemas, examples, conformance reports
├── evidence/          # Logs, traces, test reports, UI screenshots/videos
├── sbom/              # SPDX/CycloneDX manifests
├── reports/           # Human-readable summaries (HTML/Markdown)
└── progress/
    └── progress.log.jsonl  # Chronological log of all actions
```

### 8.1 `progress.log.jsonl` Schema (Concise)

```json
{
  "timestamp": "ISO-8601",
  "loop_id": "ulid",
  "area": "short-area-label",
  "assumptions": ["text"],
  "actions": ["text"],
  "metrics_before": {"coverage": 0.82, "p95_ms": 420, "a11y_critical": 3, "errors": 27},
  "metrics_after":  {"coverage": 0.85, "p95_ms": 375, "a11y_critical": 0, "errors": 5},
  "contracts": {"breaking": false, "validated": true},
  "gates_added": ["coverage>=85% line+branch", "secrets-scan required"],
  "artifacts": ["relative/path/to/report.html", "artifacts/evidence/test-report.xml"],
  "next_steps": ["codemod: remove legacy theme tokens", "raise perf budget on /search"],
  "risks": ["none"],
  "rollbacks": ["n/a"]
}
```

### 8.2 SBOM/Inventory Summary (YAML)

```yaml
build:
  reproducible: true
  lockfiles_verified: true
dependencies:
  count: 0
  disallowed: []
security:
  critical_vulns: 0
  high_vulns: 0
  secrets_found: 0
contracts:
  schemas_valid: true
  breaking_changes: false
```

### 8.3 Decision Records (Concise ADR)

* **Context:** one paragraph
* **Decision:** one sentence
* **Consequences:** bullet list (pros/cons, risks)
* **Alternatives:** brief bullets
* **Links:** PRs, artifacts, logs

---

## 9) Hardened Security & Code Audit Annex

> **Goal:** Zero‑trust, multi‑layer forensic assurance. The system assumes code is unsafe until proven otherwise.

### 9.1 Reality Validation Matrix

* **Business logic coherence** vs stated purpose (README/docs/backlog).
* **Dependency legitimacy** (typosquats, deprecated libs, malicious uploads).
* **Obfuscation detection** (base64/hex/char‑code tricks, pyarmor, string concatenation).
* **Steganography** in media/configs.
* **Crypto/Blockchain/Mining** detection patterns.
* **Data exfiltration** (unexpected outbound, DNS tunneling, covert channels).
* **Anti‑analysis** (VM/debugger detection, timing attacks).
* **Behavioral anomalies** (sleeps, hidden daemons, resource spikes).
* **Privacy leaks** (PII in logs), **zero‑day similarity** heuristics.

### 9.2 ULTRA‑STRICT CHECKS (Enforced in CI)

* **Cyclomatic complexity > 10 → CRITICAL**
* **Cognitive complexity > 15 → BRAIN MELT**
* **Function length > 50 lines → REFACTOR MANDATORY**
* **Test coverage < 90% → UNACCEPTABLE**
* **Documentation coverage < 80% → LAZY DEVS**
* **PEP‑8/PEP‑484 violations → PUBLIC SHAMING**
* **Unused imports/variables → WASTEFUL**
* **Deep inheritance (> 3) → ARCHITECTURE FAILURE**
* **Big‑O alarms**, memory leaks, N+1 queries, blocking sync I/O in async, GIL contention hotspots, IaC risks, privilege escalation vectors, logging/telemetry completeness.

### 9.3 Python Annex (if Python present)

**Static:** Ruff/Flake8 + Black, MyPy (strict), Bandit, Semgrep ruleset (custom), `pip-audit`/OSV, license scanner.

**Dynamic:** Property‑based tests (Hypothesis), fuzzing targets, sandboxed execution, chaos/latency injection on critical paths.

**Red flags:** `eval/exec/__import__`, unsafe `pickle`/`yaml.load`, subprocess with untrusted input, weak crypto (MD5/SHA1, RSA<2048), unsafe deserialization, template injection, path traversal, SSRF/XXE, prompt‑injection for LLMs.

**Deliverables:** risk score (0‑100), vuln breakdown with CVEs, annotated diffs, automated patch suggestions, technical‑debt ledger, CFG/DFD/call‑graph visuals.

> *Note:* Mirror equivalent annexes for other stacks (JS/TS, JVM, Go, Rust) with stack‑native tools.

---

## 10) CI/CD Reference Implementation (GitHub Actions sketch)

```yaml
name: aeos
on: [pull_request, push]
jobs:
  discover:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: SBOM
        run: >
          syft dir:. -o cyclonedx-json > artifacts/sbom/sbom.json
      - name: Snapshot
        run: python scripts/snapshot.py --out artifacts/snapshot

  test_and_quality:
    runs-on: ubuntu-latest
    needs: discover
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: '3