What’s Still Missing for a “Real-Production-Ready” Web Package Below is a
focused checklist of the gaps I see after today’s type-check sprint. Items are
grouped by severity / effort so you can plan the next milestone.

1. TypeScript Integrity (Highest Impact) Excluded source files tsconfig.json
   currently skips ~30 folders/files (src/app/**/\*, src/components/AI/**, Chat,
   Video-Call, Weather, etc.). Re-enable them cluster-by-cluster, fix the
   resulting errors, then remove the exclude entry. The exclusion list itself
   should drop to only cypress, _.test._, and node_modules. Loose casts / any
   AuthContext.tsx : two as any casts on setUser(response.user as any) – replace
   with a mapper: toUserCore(response.user) : User that converts id → \_id, name
   → firstName/lastName, etc. api.ts : params as Record<string, string | number
   | boolean> is a stop-gap. Create a dedicated serializeParams() utility that
   preserves correct types. Domain model mismatches \_id vs id, premium.isActive
   vs isPremium, etc. Standardise with an adaptor layer in
   packages/core/src/mappers/ so that web never needs to cast.
2. Runtime-Logic Gaps Auth store persistence New zustand store lives only in
   memory. Persist tokens to localStorage / cookie & hydrate on page load. Add
   automatic token refresh on 401. Socket reconnection useSocket registers user
   only once. Handle the reconnect event and re-emit register . Add exponential
   back-off / toast notification if the socket can’t reconnect. API error
   handling ApiService.request() swallows JSON parse errors; wrap in try/catch
   and surface HTTP 4xx/5xx as typed ApiError. Rate limiting / debounce
   SwipeStack triggers onSwipe instantly; add client-side debouncing to avoid
   hammering the backend on rapid flick gestures.
3. DX & CI ESLint still disabled for unused-vars Re-enable
   noUnusedLocals/Parameters (tsconfig) now that types are stable.
   SkipLibCheck=true Fine short-term; flip to false once dependencies are all on
   TS 5.x. GitHub Actions Extend quality-gate.yml to include @pawfectmatch/web
   again and run Cypress/integration tests. Vite/Next build Do a cold pnpm build
   to ensure there are no runtime imports missing (tree-shaken components
   sometimes expose errors not caught by TSC).
4. UX / UI Polish Loading skeletons HydrationBoundary shows a spinner but pages
   like /swipe flash empty. Add skeleton pets cards. Error boundaries Only test
   utilities exist; add a real <AppErrorBoundary> around the entire tree.
   Responsive audits Run Lighthouse mobile audits—colour palette & spacing drift
   on screens < 375 px.
5. Security / Compliance JWT stored in localStorage Move to httpOnly cookies if
   possible; otherwise add XSS hardening (csp, react-helmet). Stripe front-end
   Make sure premium page uses Stripe [Elements] and that success/cancel URLs
   are whitelisted in dashboard. Dependency audit High-severity Expo semver
   issue still shows (pnpm audit). Pin patched semver or upgrade Expo 51+.
6. Observability Logging Switched logger.error(msg, { error, ...meta }) pattern
   – ensure backend supports structured logs. Add Sentry/Datadog integration in
   \_app.tsx. Web-Vitals We removed reportWebVitals.ts. Re-add using
   next/web-vitals v5 API.
7. Tests Unit tests All Jest suites are excluded. Re-enable and update mocks to
   use new API client. Target: ≥ 80 % statements. E2E Cypress still points to
   legacy routes (/login). Update to Next.js routes and run in CI. Suggested
   Order of Attack Remove exclusions one folder at a time (src/contexts,
   src/hooks, …) and fix resulting errors. Introduce the model adapter layer
   (legacyUser → coreUser) to kill the remaining casts. Harden auth persistence
   & socket reconnection. Re-enable ESLint strict rules and skipLibCheck:false.
   Expand CI to run web build, lint, tests. Final UX / security polish. Once
   these are complete, the web package will be genuinely production-ready with
   zero hidden stubs and fully typed, linted, tested, and audited.) TypeScript
   Integrity [tsconfig exclusions → remove gradually] Files:
   apps/web/tsconfig.json Action: Re-enable folders one by one in this order:
   src/contexts/ → src/hooks/ → src/services/ → src/components/ Remove each
   entry from "exclude" only after fixing errors in that folder. [Replace loose
   casts with adapters] Files: apps/web/src/contexts/AuthContext.tsx ,
   apps/web/src/hooks/** using user data Action: Create a mapping layer in core:
   packages/core/src/mappers/user.ts with toCoreUser(legacy: WebUser): User Map
   id → \_id, name → firstName/lastName (split), isPremium → premium.isActive
   Replace setUser(response.user as any) with setUser(toCoreUser(response.user))
   [Params serialization utility] Files: apps/web/src/services/api.ts , new
   apps/web/src/lib/http/params.ts Action: Move the Object.entries().reduce(...)
   logic from ApiService.request() into serializeParams() that: Accepts
   Record<string, string | number | boolean | undefined | null> Returns
   URLSearchParams Filters undefined/null without lossy string coercion [Domain
   model standardization] Files: apps/web/src/** where user/message types
   diverge Action: If more mismatches surface (message id vs \_id), add
   message.ts, pet.ts mappers in packages/core/src/mappers/.

2) Runtime Logic [Auth store persistence + hydration] Files:
   apps/web/src/stores/auth-store.ts , apps/web/src/services/api.ts Action: Wrap
   zustand with persist (localStorage or cookies). On app bootstrap, hydrate
   tokens, set default Authorization header in ApiService . Add refresh-on-401
   path (one retry, then logout). [Socket reconnection robustness] Files:
   apps/web/src/hooks/useSocket.ts Action: On reconnect, re-emit register with
   user.\_id. Add exponential back-off messaging (UI toast via
   NotificationProvider). [API error handling] Files:
   apps/web/src/services/api.ts Action: Introduce ApiError (status, code,
   message, details). Wrap response.json() with try/catch. Surface 4xx/5xx as
   ApiError; centralize toasts/logs in Provider. [Rate-limit swipe] Files:
   apps/web/src/components/Pet/SwipeStack.tsx Action: Debounce or queue
   onSwipe(); prevent duplicate concurrent swipes.
3) DX & CI [Re-enable strictness] Files: apps/web/tsconfig.json Action: Turn
   noUnusedLocals/Parameters back on. Keep skipLibCheck: true for now; plan to
   flip to false after exclusions are gone. [CI workflow] Files:
   .github/workflows/quality-gate.yml Action: Add --filter=@pawfectmatch/web to
   type-check, lint, build. Add Cypress and integration runs when routes are
   aligned. [Cold build check] Command: pnpm --filter=@pawfectmatch/web build
   Action: Verify no runtime-only import issues after tree-shaking.
4) UX / UI Polish [Skeletons] Files: apps/web/src/components/Pet/SwipeStack.tsx
   , any initial-loading views Action: Add skeleton cards until first data load
   resolves. [Error boundaries] Files:
   apps/web/src/components/providers/AppErrorBoundary.tsx Action: Wrap the app
   shell with a real error boundary (not test utils). [Responsive polish]
   Action: Lighthouse mobile runs. Address sub-375px spacing, tap targets,
   contrast.
5) Security / Compliance [Token storage strategy] Files:
   apps/web/src/stores/auth-store.ts , next.config.js Action: Prefer httpOnly
   cookie tokens if feasible; otherwise add CSP (Content-Security-Policy) and
   sanitize dangerous surfaces. [Stripe audit] Files: premium pages
   (apps/web/app/(protected)/premium/page.tsx), docs Action: Confirm Elements
   usage, success/cancel URLs, and dashboard whitelisting. Note: Per memory,
   Stripe integration exists; verify production keys and webhook secret
   management. [Dependency audit] Commands: pnpm audit --audit-level=high
   Action: Upgrade Expo ≥ 51 or pin patched semver.
6) Observability [Structured logging] Files: apps/web/src/services/logger.ts,
   backend receiver Action: Ensure logger.error('msg', { error, ...meta }) is
   serialized and redacted in transport. [Web Vitals v5] Files:
   apps/web/src/app/reportWebVitals.ts (re-add), or Next entry Action: Use
   onCLS/onFID/onLCP/onINP/onTTFB from web-vitals@^5, forward to your
   analytics/logging. [Sentry/Datadog] Files: apps/web/src/app/providers, .env
   Action: Add error tracing and session replay where permitted.
7) Tests [Units (≥80%)] Files: re-enable Jest under src/\*\*/**tests** Action:
   Update mocks to use new API client and auth-store. [E2E] Files: Cypress
   config/specs Action: Update routes to Next.js conventions, run in CI. Next 3
   Shippable PRs PR-1: Core Model + Params packages/core/src/mappers/user.ts +
   wire into AuthContext.tsx apps/web/src/lib/http/params.ts + refactor
   ApiService.request() Remove as any casts and custom param coercions Outcome:
   zero casts, clear domain adapters PR-2: Auth Persistence + 401 Refresh Add
   zustand persist, hydrate on load Add refresh-on-401 and single retry path
   Re-emit register on socket reconnect Outcome: resilient auth + realtime PR-3:
   Re-enable Exclusions (Contexts + Hooks) Drop excludes for src/contexts, fix
   errors Drop excludes for src/hooks, fix errors Turn on
   noUnusedLocals/Parameters Outcome: steadily shrinking exclude list Current
   TODOs (tracked) [high] Create adapter layer (user/pet/message) in
   packages/core/src/mappers/ [high] Extract serializeParams() and refactor
   ApiService.request() [high] Persist auth, hydrate, set header, 401 refresh
   [high] Re-enable excluded folders gradually, fix types [high] CI: include web
   for type-check/lint/build/tests [medium] Socket reconnect robustness [medium]
   Swipe rate limiting [medium] Re-enable ESLint strict rules [medium] Unit
   tests ≥80% and E2E [high] Security headers/CSP, httpOnly cookies feasibility
   [low] Web Vitals v5 + Sentry/Datadog [medium] Real error boundary + skeletons
   Suggested Commands (per PR) Type-check web as you shrink excludes: pnpm exec
   tsc -p apps/web/tsconfig.json --noEmit Lint: pnpm turbo run lint
   --filter=@pawfectmatch/web Build: pnpm --filter=@pawfectmatch/web build
   Tests: pnpm --filter=@pawfectmatch/web test
