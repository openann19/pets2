# GitHub Copilot Instructions Guide

## Overview

This repository is configured with comprehensive GitHub Copilot instructions to help the coding agent understand the codebase, standards, and best practices. This guide explains the setup and how to use it effectively.

## What Are Copilot Instructions?

GitHub Copilot instructions are Markdown files that provide context and guidance to GitHub Copilot coding agent when working on issues in your repository. They help Copilot:

- Understand your project's architecture and conventions
- Follow your team's coding standards
- Make appropriate technology choices
- Write tests that match your testing patterns
- Maintain consistency across the codebase

## File Structure

### Repository-Wide Instructions

**`.github/copilot-instructions.md`** (334 lines)

This is the main instructions file that applies to the entire repository. It covers:

- **Project Overview**: Monorepo structure, technology stack, package manager
- **Core Principles**: Type safety, quality gates, minimal changes, testing
- **Technology Stack**: React 18.2.0, Next.js, React Native, Node.js, MongoDB
- **Code Quality Standards**: TypeScript rules, React conventions, naming patterns
- **Testing Requirements**: Unit, integration, E2E testing with Jest, Playwright, Detox
- **Security Standards**: Authentication, input validation, dependency management
- **Performance Guidelines**: Web and mobile optimization, caching strategies
- **Accessibility**: WCAG compliance, ARIA labels, semantic HTML
- **Animation Standards**: Framer Motion (web) and Reanimated (mobile) patterns
- **Design System**: Theme structure, component library usage
- **Build & Development**: Commands, pre-commit checks, quality gates
- **Common Patterns**: API calls with React Query, form handling, error handling
- **Troubleshooting**: Common issues and solutions

### Path-Specific Instructions

These files apply to specific parts of the codebase using YAML frontmatter:

#### **`.github/instructions/mobile.instructions.md`** (302 lines)
- **Applies to**: `apps/mobile/**`
- **Covers**: React Native components, styling with design tokens, animations with Reanimated, navigation, state management, forms, performance, accessibility, testing, API integration, platform-specific code

#### **`.github/instructions/web.instructions.md`** (573 lines)
- **Applies to**: `apps/web/**`
- **Covers**: Next.js Pages Router, routing & navigation, data fetching, images, Tailwind CSS styling, Framer Motion animations, React Query patterns, forms with React Hook Form + Zod, Socket.io integration, performance optimization, accessibility, testing

#### **`.github/instructions/server.instructions.md`** (674 lines)
- **Applies to**: `server/**`
- **Covers**: Express architecture, route organization, controller pattern, service layer, MongoDB & Mongoose, authentication & authorization, input validation, error handling, Socket.io, rate limiting, security middleware, testing, environment variables, logging, performance optimization

#### **`.github/instructions/packages.instructions.md`** (555 lines)
- **Applies to**: `packages/**`
- **Covers**: Core package (business logic), UI package (shared components), design tokens (theme system), core errors (error handling), security package (encryption, sanitization), AI package (compatibility algorithms), package development guidelines, dependency rules, versioning

## How Copilot Uses These Instructions

When GitHub Copilot coding agent works on an issue:

1. **Context Loading**: Copilot reads the repository-wide instructions first
2. **Path Matching**: If working in a specific area (e.g., `apps/mobile/`), it also loads the relevant path-specific instructions
3. **Decision Making**: Copilot uses these instructions to make informed decisions about:
   - Which libraries and patterns to use
   - How to structure code
   - What testing approach to take
   - How to handle errors
   - Where to place files
   - Naming conventions to follow

## Key Features of Our Instructions

### 1. Technology Choices
- ✅ React 18.2.0 (stable, NO React 19 migration)
- ✅ TypeScript 5.9.2 in strict mode
- ✅ pnpm 9.15.0 for package management
- ✅ Turborepo for monorepo orchestration
- ✅ React Query for server state
- ✅ React Hook Form + Zod for forms
- ✅ Framer Motion (web) / Reanimated (mobile) for animations

### 2. Quality Standards
- TypeScript strict mode: No `any`, no `@ts-ignore` outside tests
- ESLint with zero warnings
- Test coverage: 80%+ (90%+ for packages)
- Accessibility: WCAG AA compliance
- Performance: 60fps mobile, Lighthouse 90+ web

### 3. Architecture Patterns
- Monorepo with workspace packages
- Separation of concerns: Controllers → Services → Models
- React Query for server state, local state for UI
- Design tokens as single source of truth
- Error handling with typed error codes

### 4. Testing Approach
- Jest for unit tests
- React Testing Library for component tests
- Playwright (web) / Detox (mobile) for E2E
- Integration tests with mocked dependencies
- Tests co-located with source in `__tests__` directories

## Using Copilot with These Instructions

### For Issues Assigned to Copilot

When you assign an issue to `@copilot`, it will:

1. Read these instructions to understand the project
2. Follow the conventions and patterns defined
3. Use the correct libraries and approaches
4. Write tests that match your testing patterns
5. Submit a PR with changes that align with your standards

### For Manual Copilot Use

When using Copilot in your IDE (VS Code, etc.):

- Copilot suggestions will be more aligned with project standards
- Code completions will use the correct patterns
- Chat responses will reference project-specific approaches

## Maintenance

### Updating Instructions

When project conventions change, update the relevant instruction files:

- **Tech stack changes**: Update `.github/copilot-instructions.md` technology section
- **New patterns**: Add examples to path-specific files
- **Quality standards**: Update the quality gates and thresholds
- **New packages**: Update `packages.instructions.md`

### Adding New Path-Specific Instructions

To add instructions for a new area:

1. Create `.github/instructions/[area].instructions.md`
2. Add YAML frontmatter with `applyTo` paths:
   ```yaml
   ---
   applyTo:
     - 'your/path/**'
   ---
   ```
3. Write clear, actionable guidance in Markdown

## Benefits

✅ **Consistency**: Copilot follows your team's standards automatically
✅ **Onboarding**: New contributors (human or AI) understand patterns faster  
✅ **Quality**: Code adheres to quality standards without manual review
✅ **Speed**: Less back-and-forth on PRs about conventions
✅ **Documentation**: Living documentation that stays up-to-date

## Best Practices for Writing Instructions

1. **Be Specific**: "Use React Query for server state" not "Manage state well"
2. **Include Examples**: Show code patterns, don't just describe them
3. **Explain Why**: Context helps Copilot make better decisions
4. **Keep Updated**: Review and update quarterly or when standards change
5. **Use Headings**: Organize with clear hierarchical structure
6. **Link to Docs**: Reference internal docs (README, ARCHITECTURE, etc.)

## Resources

- [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [Custom Instructions Documentation](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)
- Project Architecture: `ARCHITECTURE.md`
- Code Review Guidelines: `CODE_REVIEW_GUIDELINES.md`
- Multi-Agent System: `AGENTS.md`

## Summary

This repository has **2,438 lines** of comprehensive instructions across 5 files:

| File | Lines | Purpose |
|------|-------|---------|
| `copilot-instructions.md` | 334 | Repository-wide guidance |
| `mobile.instructions.md` | 302 | React Native/Expo specifics |
| `web.instructions.md` | 573 | Next.js web app guidance |
| `server.instructions.md` | 674 | Node.js backend patterns |
| `packages.instructions.md` | 555 | Shared packages standards |

These instructions ensure GitHub Copilot delivers high-quality, consistent code that matches your team's standards and architecture.

---

**Questions or improvements?** Update these instructions and submit a PR!
