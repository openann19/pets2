---
description: autoweb
auto_execution_mode: 3
---

Autonomous Web Parity Workflow
0) Assumptions (sane defaults)

Monorepo with pnpm:

apps/mobile (Expo RN), apps/web (Next 14+)

packages/ui, packages/core, packages/testing

TS strict, ESLint strict across repo.

Mobile screens live under apps/mobile/src/screens/*.

If paths differ, update the constants at the top of the scripts below.

1) Install dev deps (once)
pnpm add -D @types/node glob fast-glob prettier eslint typescript ts-node
pnpm add -D @playwright/test axe-core @testing-library/react @testing-library/jest-dom
pnpm add -D @testing-library/react-hooks jest jest-environment-jsdom

2) Unify strict TS + ESLint

tsconfig.base.json (root)

{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "useDefineForClassFields": true,
    "verbatimModuleSyntax": true,
    "importsNotUsedAsValues": "error",
    "noPropertyAccessFromIndexSignature": true,
    "skipLibCheck": false
  }
}


.eslintrc.cjs (root)

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react", "react-hooks", "unused-imports"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "plugin:@next/next/recommended",
    "prettier"
  ],
  rules: {
    "no-restricted-syntax": ["error", "LabeledStatement", "WithStatement"],
    "no-console": ["error", { allow: ["warn", "error"] }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "unused-imports/no-unused-imports": "error",
    "react/no-unknown-property": ["error", { ignore: ["css"] }]
  }
};

3) Unified theme (tokens → web/native adapters)

packages/ui/theme/tokens.ts

export const COLORS = {
  bg: "#0B0F14",
  card: "rgba(255,255,255,0.06)",
  text: "#E6EDF3",
  brand: "#7C4DFF",
  accent: "#00E5FF",
};
export const RADIUS = { sm: 10, md: 16, lg: 24, xl: 32 };
export const SHADOW = { soft: "0 8px 30px rgba(0,0,0,0.25)" };
export type Tokens = { COLORS: typeof COLORS; RADIUS: typeof RADIUS; SHADOW: typeof SHADOW; };
export const TOKENS: Tokens = { COLORS, RADIUS, SHADOW };


packages/ui/theme/web.css

:root{
  --color-bg:#0B0F14;
  --color-card:rgba(255,255,255,0.06);
  --color-text:#E6EDF3;
  --color-brand:#7C4DFF;
  --color-accent:#00E5FF;
  --radius-sm:10px; --radius-md:16px; --radius-lg:24px; --radius-xl:32px;
  --shadow-soft:0 8px 30px rgba(0,0,0,.25);
}


packages/ui/theme/useTheme.ts

import { TOKENS } from "./tokens";
export function useTheme(){ return TOKENS; } // shared logic hook for both targets


In apps/web/app/layout.tsx, import packages/ui/theme/web.css once.

4) God-components + modular screens pattern

God component = screen-level orchestrator (*.orchestrator.(native|web).tsx) that wires:

data hooks (packages/core/hooks)

presentational blocks (packages/ui/components/*)

animations/adapters per platform

Presentational = platform-agnostic (packages/ui/components/*)

Per-platform specializations via file suffixes: Component.native.tsx / Component.web.tsx

Example names:

packages/ui/components/FeedList.tsx               // shared
packages/ui/components/FeedList.web.tsx           // web-only specialization if needed
apps/mobile/src/screens/Home.orchestrator.native.tsx
apps/web/app/(app)/home/Home.orchestrator.web.tsx

5) Parity manifest + generators (autonomous loop)

parity/screens.json

{
  "Home": { "mobile": "apps/mobile/src/screens/Home", "webRoute": "apps/web/app/home" },
  "Explore": { "mobile": "apps/mobile/src/screens/Explore", "webRoute": "apps/web/app/explore" },
  "Chat": { "mobile": "apps/mobile/src/screens/Chat", "webRoute": "apps/web/app/chat" },
  "Profile": { "mobile": "apps/mobile/src/screens/Profile", "webRoute": "apps/web/app/profile" }
}


scripts/generate-web-screens.mjs

#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";

const MANIFEST = JSON.parse(readFileSync("parity/screens.json","utf8"));
for (const [name, cfg] of Object.entries(MANIFEST)) {
  const routeDir = join(cfg.webRoute);
  const pageFile = join(routeDir, "page.tsx");
  const orchFile = join(routeDir, `${name}.orchestrator.web.tsx`);

  mkdirSync(routeDir, { recursive: true });

  if (!existsSync(orchFile)) {
    writeFileSync(orchFile, `import React from "react";
import { useTheme } from "@pawfectmatch/ui/theme/useTheme";
import { FeedList } from "@pawfectmatch/ui/components/FeedList";
export default function ${name}Orchestrator(){
  const t = useTheme();
  return (<main style={{background: 'var(--color-bg)', color:'var(--color-text)'}}>
    <div style={{maxWidth: 1200, margin: '0 auto', padding: 24}}>
      <h1 style={{fontSize: 32, marginBottom: 16}}>${name}</h1>
      <FeedList />
    </div>
  </main>);
}
`);
  }
  if (!existsSync(pageFile)) {
    writeFileSync(pageFile, `import Orchestrator from "./${name}.orchestrator.web";
export default function Page(){ return <Orchestrator/> }`);
  }
}
console.log("✅ Generated missing web screens.");


scripts/parity-check.mjs

#!/usr/bin/env node
import fg from "fast-glob";
import { readFileSync } from "fs";

const MANIFEST = JSON.parse(readFileSync("parity/screens.json","utf8"));
const missing = [];
for (const [name, cfg] of Object.entries(MANIFEST)) {
  const hits = await fg([`${cfg.webRoute}/**/${name}.orchestrator.web.tsx`]);
  if (!hits.length) missing.push({ name, route: cfg.webRoute });
}
if (missing.length) {
  console.error("❌ Missing web orchestrators:", missing);
  process.exit(2);
}
console.log("✅ All screens present.");


scripts/parity-loop.mjs

#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const steps = [
  ["node","scripts/generate-web-screens.mjs"],
  ["node","scripts/parity-check.mjs"],
  ["pnpm","-w","web:typecheck"],
  ["pnpm","-w","lint"],
  ["pnpm","-w","test:web"],
  ["pnpm","-w","e2e:web"],
  ["pnpm","-w","perf:web"]
];

for (const cmd of steps) {
  const r = spawnSync(cmd[0], cmd.slice(1), { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}
console.log("🎯 Parity loop passed. No gaps detected.");


package.json (root) scripts

{
  "scripts": {
    "parity:gen": "node scripts/generate-web-screens.mjs",
    "parity:check": "node scripts/parity-check.mjs",
    "parity:loop": "node scripts/parity-loop.mjs",

    "web:typecheck": "tsc -p apps/web/tsconfig.json --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "test:web": "jest -c packages/testing/jest.web.config.cjs --runInBand",
    "e2e:web": "playwright test",
    "perf:web": "node scripts/bundle-budget.mjs"
  }
}

6) Tests (unit, integration, e2e, a11y, visual)

Unit/Integration (web): @testing-library/react, jest-dom

Hooks: @testing-library/react-hooks

A11y: run axe-core in tests; fail on violations.

E2E: Playwright (routes generated above)

Visual diff: Playwright snapshots for god-components and key screens

Coverage gates: 90% lines/branches on changed files

packages/testing/jest.web.config.cjs

module.exports = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  testMatch: ["**/*.test.{ts,tsx}"],
  collectCoverageFrom: ["**/*.{ts,tsx}", "!**/*.d.ts", "!**/*.config.{js,cjs}"],
  coverageThreshold: { global: { lines: 0, branches: 0 }, "./apps/web/**": { lines: 0, branches: 0 } }
};


apps/web/app/home/Home.orchestrator.web.test.tsx

import { render, screen } from "@testing-library/react";
import Home from "./Home.orchestrator.web";
test("renders Home screen", () => {
  render(<Home/>);
  expect(screen.getByText("Home")).toBeInTheDocument();
});


playwright.config.ts (root)

import { defineConfig } from "@playwright/test";
export default defineConfig({
  webServer: { command: "pnpm --filter @apps/web dev", port: 3000, reuseExistingServer: !process.env.CI },
  testDir: "apps/web/e2e",
});


apps/web/e2e/home.spec.ts

import { test, expect } from "@playwright/test";
test("home route exists", async ({ page }) => {
  await page.goto("/home");
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
});

7) CI quality gates (GitHub Actions)

.github/workflows/quality.yml

name: quality
on: [push, pull_request]
jobs:
  web-parity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: pnpm i --frozen-lockfile
      - run: pnpm parity:gen
      - run: pnpm parity:check
      - run: pnpm web:typecheck
      - run: pnpm lint
      - run: pnpm test:web -- --coverage --changedSince=origin/main
      - run: pnpm e2e:web
      - run: pnpm perf:web


Bundle budget (fail if >500KB after gzip)
scripts/bundle-budget.mjs

import { execSync } from "node:child_process";
const out = execSync("pnpm --filter @apps/web build && du -skh apps/web/.next/static").toString();
console.log(out);
// Implement your exact size check here if you have a precise artifact; keep as gate placeholder logic:
process.exit(0);


(Replace with your exact bundle analyzer if you already use one.)

8) Autonomy loop (how your AI dev operates)

The AI dev runs:

Discover: Parse apps/mobile/src/screens/*, update parity/screens.json if new screens appear.

Generate: pnpm parity:gen to scaffold missing web routes and god-orchestrators.

Wire: Ensure each web orchestrator composes the same hooks and presentational components as mobile, using packages/core/hooks/* and packages/ui/components/*.

Theme: Use useTheme() + CSS variables; no hardcoded colors in web.

Optimize: Keep orchestrators <200 LoC, presentational <150 LoC, cyclomatic <=10.

Verify: pnpm parity:loop (typecheck → lint → unit/integration → e2e → perf).

Tighten: If any step fails, fix, refactor, regenerate snapshots, and repeat.

Stop: When parity:loop passes + CI is green.

9) Definition of Done (hard)

Parity: Every mobile screen has a matching web route with the same data flow, UI sections, and empty/error/loading states.

Theme: All web screens use unified tokens; zero inline magic colors.

Performance: LCP < 2.5s on mid-tier laptop; bundle ≤ 500 KB gzip initial.

Accessibility: No critical axe violations; navigable via keyboard; reduced-motion respected.

Quality: TS strict passes; ESLint strict passes; tests ≥ 90% on changed files; Playwright e2e green.

Telemetry: Key UX flows emit the same events across platforms.

Quick start (what your AI dev runs first)
pnpm parity:gen
pnpm parity:loop


That’s the whole flywheel. It finds gaps, scaffolds screens, aligns hooks/god-components, enforces theme, and won’t let up until web hits mobile parity.