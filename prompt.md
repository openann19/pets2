"Your mission is to execute a final, comprehensive hardening process to make this project 100% production-ready. You will follow this multi-phase plan systematically to achieve a perfectly clean, secure, and performant codebase."

Phase 1: Acknowledge Diagnostic Report
"The initial 'State of the Union' diagnostics have been completed. Here is the summary:"
Build Status: The pnpm build command is failing in the apps/mobile package due to a missing metro-react-native-babel-transformer module.
Security Status: The pnpm audit reports 5 vulnerabilities (moderate and low) in Sentry, validator, and cookie.
Code Quality: The pnpm lint command reports zero errors but has numerous warnings for react-hooks/exhaustive-deps and no-unused-vars.
Test Status: The root test script is misconfigured and fails to run with the --coverage flag.
Phase 2: Execute Foundational Fixes (Achieve "Green Baseline")
"Based on the report, your immediate task is to execute these fixes to achieve a 'green' baseline."
Fix the Mobile Build: Install the missing metro-react-native-babel-transformer dependency in the apps/mobile workspace.
Resolve Security Vulnerabilities: Update the vulnerable dependencies (@sentry/browser, validator, cookie) to their latest patched versions.
Achieve Perfect Code Quality:
Fix all react-hooks/exhaustive-deps warnings by adding the correct dependencies to the arrays. Do not use eslint-disable.
Remove all unused variables flagged by the linter.
Fix the Root Test Script: Reconfigure the root package.json so that pnpm test -- --coverage correctly passes the --coverage flag to all workspaces.
Final Verification: After these fixes, run pnpm build, pnpm audit, pnpm lint, and pnpm test -- --coverage to confirm that all checks pass with zero errors.
Phase 3: Deep Hardening & Enhancement
"With a stable 'green' baseline, you will now elevate the project to production grade."
Security: Implement robust input validation (using Zod) on all API endpoints. Conduct a security audit for common vulnerabilities like IDOR (Insecure Direct Object Reference) and XSS (Cross-Site Scripting).
Test Coverage: Increase test coverage to over 85% for all critical packages (e.g., packages/core, server/src/services). Implement missing E2E tests for the most critical user flows (e.g., the full payment and subscription flow).
Performance: Run performance audits (Lighthouse for web, and internal benchmarks for mobile). Identify and optimize slow components, heavy API endpoints, and inefficient database queries.
Code Quality: Refactor any remaining "God Components" (overly large files), remove all console.log statements, and eliminate all uses of the any type.
Phase 4: Final Polish & Deployment Prep
Review CI/CD: Inspect the .github/workflows and ensure they are optimized and correctly configured for automated testing and deployment on every pull request.
Documentation: Ensure the README.md files are up-to-date and the project has a clear "getting started" guide for new developers.
Final Verification: Run all diagnostic checks one last time to confirm the project is in a perfect, production-ready state.
INITIATION COMMAND:
"Begin with Phase 2 now, using the provided diagnostic information. Your goal is a flawless production release."