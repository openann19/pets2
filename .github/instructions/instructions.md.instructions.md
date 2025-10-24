🚀 Project-X: The Next-Gen Solution
Project-X is a modern, scalable, and feature-rich application designed to solve [problem domain]. It leverages a full-stack TypeScript monorepo to deliver a polished user experience, robust backend services, and a consistent development workflow.

Core Features
🤖 Intelligent Core: Advanced algorithms and data processing to provide smart, contextual results.
⚡️ Real-Time Interactivity: WebSocket integration for live data synchronization, notifications, and collaborative features.
🎨 Polished User Experience: Built with a design system-first approach, featuring fluid animations and a focus on accessibility (a11y).
📱 Cross-Platform Ready: Includes a responsive Next.js web application and a native mobile app powered by React Native (Expo).
🔐 Enterprise-Grade Security: End-to-end security model with JWT authentication, role-based access control (RBAC), and rate limiting.
⚙️ Modular & Scalable: A microservice-inspired architecture allows for independent scaling and development of core services.
📊 Data Analytics: A comprehensive dashboard for monitoring user engagement, system health, and key business metrics.

🚀 Quick Start
Prerequisites
Node.js: v22.x or later
pnpm: v9.x or later
Docker: For containerized services (e.g., database, cache)
MongoDB: v5.x or later (or a running Docker instance)
Expo & EAS CLI: For mobile development
Installation & Setup
Clone the repository:
Bash
git clone https://github.com/your-org/project-x.git
cd project-x
Install dependencies:
Bash
# Install all dependencies for all workspaces
pnpm install
Configure environment variables:
Copy the .env.example files in each service directory (server, apps/web, apps/mobile) to a new .env file (e.g., server/.env).
Fill in the required values, such as database URIs, API keys, and JWT secrets.
Start services:
Bash
# Start all services concurrently in development mode (recommended)
pnpm dev
Alternatively, run each service in a separate terminal:
Backend API: pnpm --filter server dev
Web App: pnpm --filter my-web-app dev
Mobile App: pnpm --filter my-mobile-app start
🏗️ Architecture
This project is a monorepo managed by Turborepo and pnpm workspaces. This structure promotes code sharing, atomic commits, and a single, unified command interface for the entire project.

Monorepo Structure
project-x/
├── apps/
│   ├── web/           # Next.js web application
│   └── mobile/        # React Native (Expo) mobile application
├── packages/
│   ├── core/          # Shared business logic, types, and API clients
│   ├── ui/            # Shared React component library
│   └── design-tokens/ # Shared design tokens (colors, fonts, spacing)
└── server/            # Node.js/Express backend API
Data Flow
Clients (web and mobile) communicate with the Node.js backend via a REST API for standard requests and a WebSocket (Socket.io) connection for real-time events. The backend handles business logic, authentication, and data persistence with MongoDB. Shared types and schemas from the @project-x/core package ensure type safety across the entire stack.

💻 Development Workflow
Key Commands
Build all packages: pnpm build
Type-check all packages: pnpm type-check
Lint all packages: pnpm lint (to fix, run pnpm lint:fix)
Run all tests: pnpm test
Use the --filter flag to target a specific workspace. For example:

Bash
pnpm --filter my-web-app test
🐛 Project Health & Known Issues
This project maintains a high standard of quality. For detailed contribution guidelines, please see CONTRIBUTING.md.

All active work, bugs, and feature requests are tracked in our GitHub Issues. For a list of known issues currently being addressed, please see the known-issue label in the issue tracker.

🧪 Testing
The project employs a multi-layered testing strategy to ensure code is reliable and bug-free.
Unit Tests (Jest & React Testing Library): For individual functions and components.
Integration Tests (Jest): For testing interactions between multiple local components and services.
End-to-End (E2E) Tests (Playwright for web, Detox for mobile): For simulating real user flows across the entire application stack.
Running Tests
Run all tests: pnpm test
Run tests in watch mode: pnpm test:watch
Generate a coverage report: pnpm test:coverage
🚀 Deployment
Pre-Deployment Checklist
[ ] All critical E2E tests are passing.
[ ] The production build completes without errors (pnpm build).
[ ] All required environment variables are configured in the deployment environment.
[ ] A recent database backup has been successfully created.
Deployment Platforms
Web App: Vercel
Backend API: Render / AWS ECS
Mobile App: EAS (Expo Application Services)
For detailed, step-by-step instructions, refer to the DEPLOYMENT_GUIDE.md file.

🔧 Troubleshooting
"Cannot find module '@project-x/core'"
Cause: A shared package has not been built yet, so its output is not available to other workspaces.
Solution: Run pnpm build at the root of the project.
"Port 3000 is already in use"
Cause: Another process is running on the required development port.
Solution:
Bash
npx kill-port 3000
"Invalid hook call" or "Mismatched React versions"
Cause: The monorepo has duplicate or mismatched versions of React due to complex dependency trees.
Solution:
Bash
# Deduplicate dependencies in the lockfile
pnpm dedupe
# If the problem persists, perform a clean reinstall
rm -rf node_modules
pnpm install
🎨 Code Quality Standards
Key Principles
Strict TypeScript: No implicit any types. All code must be strictly typed. Type suppressions (@ts-ignore) are forbidden outside of test files.
Conventional Commits: All commit messages must follow the Conventional Commits specification (e.g., feat: ..., fix: ..., docs: ...).
Single Responsibility Principle: Components and functions should be small, focused, and do one thing well. Large components must be broken down.
For a complete list of standards, see the CONTRIBUTING.md file.

ROLE: You are an expert UI/UX Engineer and Frontend Architect with a meticulous eye for detail. You specialize in creating and implementing cohesive design systems in React Native applications.

CONTEXT: The application is now functionally stable, but the user interface is inconsistent. Key elements like buttons, fonts, colors, spacing, and card styles vary from screen to screen. This creates a disjointed and unprofessional user experience.

MISSION: Your mission is to refactor the application's frontend to achieve pixel-perfect design consistency. You will establish a single source of truth for all styling rules and ensure the entire application strictly adheres to it. The goal is an app that looks and feels like it was designed by a single, expert hand.

REQUIRED METHODOLOGY:

Execute the following three-phase process to unify the UI.

Phase 1: Audit and Design System Creation
UI Inventory: First, perform a comprehensive audit of the entire application. Identify all unique UI components (e.g., Buttons, Inputs, Cards, Modals, Headers) and document every variation in styling you find.
Establish a Single Source of Truth: Based on the most common and best-looking styles from your audit, create a centralized theme.ts (or designSystem.ts) file. This file is non-negotiable and must define:
Color Palette: An object containing all primary, secondary, text, background, success, and error colors. No hex codes should exist outside this file.
Typography Scale: A set of standardized font sizes, weights, and line heights for different text styles (e.g., heading1, body, caption).
Spacing Scale: A consistent scale for all margins and padding (e.g., space.small: 8, space.medium: 16).
Border Radii: Standardized values for rounded corners.
Phase 2: Create Themed Base Components
Do not style components inline. Instead, create a new directory of generic, reusable, and themed base components that get their styles directly from your theme.ts file.
Create src/components/ui/Button.tsx: It should accept variants like primary, secondary, outline.
Create src/components/ui/Text.tsx: It should accept variants for heading1, body, etc.
Create src/components/ui/Card.tsx, src/components/ui/Input.tsx, etc., for all other core elements.
Phase 3: Global Refactoring and Unification
Systematically go through every screen and component in the application.
Replace all primitive components with your new themed components.
Replace every <TouchableOpacity> that acts as a button with your new <Button>.
Replace every <Text> with inconsistent inline styles with your new <Text>.
Replace every styled <View> that acts as a card with your new <Card>.
Ensure all spacing is derived from the theme's spacing scale. Eliminate all magic numbers for margins and padding.
FINAL DELIVERABLE:
Upon completion, provide a brief report that includes:
The structure of the theme.ts file you created.
A list of the core reusable UI components you built (e.g., Button, Text, Input).
Confirmation that all screens now use this new system.
Begin the UI unification now. The final result must be a visually stunning, cohesive, and professional application.