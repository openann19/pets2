# PawfectMatch Premium Monorepo

This document provides information about the monorepo structure and development workflow for the PawfectMatch Premium project.

## Monorepo Structure

```
pawfectmatch-premium/
├── apps/
│   ├── web/             # Next.js web application
│   └── mobile/          # React Native mobile app with Expo
├── packages/
│   ├── core/            # Shared business logic, types, and state management
│   └── ui/              # Shared UI components with react-aria
├── client/              # Original React web client (to be migrated)
├── server/              # Node.js/Express backend API
├── ai-service/          # Python AI service for recommendations
├── package.json         # Root package with workspace config
├── turbo.json           # Turborepo configuration
└── pnpm-workspace.yaml  # PNPM workspace configuration
```

## Technology Stack

- **Package Management**: PNPM with Workspaces
- **Build System**: Turborepo
- **Frontend Web**: Next.js (React)
- **Frontend Mobile**: React Native (Expo)
- **Backend**: Node.js with Express
- **AI Service**: Python with FastAPI
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Form Management**: React Hook Form + Zod
- **UI Components**: Headless components with react-aria
- **Styling**: Tailwind CSS (Web), StyleSheet (Mobile)
- **Animations**: Framer Motion (Web), Reanimated (Mobile)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PNPM 8.0.0+
- Python 3.8+
- MongoDB 4.4+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pawfectmatch-premium.git
   cd pawfectmatch-premium
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment variables for each project
   cp .env.example .env
   cp apps/web/.env.example apps/web/.env
   cp server/.env.example server/.env
   cp ai-service/.env.example ai-service/.env
   ```

4. **Build packages**
   ```bash
   pnpm build
   ```

5. **Start development servers**
   ```bash
   # Start all services
   pnpm dev
   
   # Or start individual services
   pnpm server:dev  # Backend API
   pnpm client:dev  # Legacy React client
   pnpm --filter @pawfectmatch/web dev  # Next.js app
   pnpm --filter @pawfectmatch/mobile dev  # Expo app
   pnpm ai:dev  # AI service
   ```

## Development Workflow

### Adding Dependencies

```bash
# Add dependency to a specific workspace
pnpm --filter @pawfectmatch/web add react-hook-form

# Add dependency to multiple workspaces
pnpm --filter "@pawfectmatch/{web,mobile}" add lodash

# Add dev dependency to root
pnpm add -Dw typescript

# Add shared dependency to all workspaces
pnpm add -W --save-exact typescript
```

### Running Scripts

```bash
# Run script in all workspaces
pnpm -r lint

# Run script in specific workspace
pnpm --filter @pawfectmatch/core build

# Run script in all workspaces that have changed since main
pnpm --filter="...[origin/main]" test
```

### Linting

```bash
# Lint all projects
pnpm lint

# Lint specific project
pnpm --filter @pawfectmatch/web lint
```

### Testing

```bash
# Run all tests
pnpm test

# Run specific tests
pnpm --filter server test
```

## Shared Package Development

### Core Package

The `@pawfectmatch/core` package contains:

- TypeScript interfaces and types
- Zod validation schemas
- Zustand stores for global state
- API client with React Query hooks
- Shared utility functions

### UI Package

The `@pawfectmatch/ui` package contains:

- Accessible headless UI components built with react-aria
- Component props are unstyled and fully typed
- Platform-agnostic components that work in both web and mobile
- Spring physics animations baked into components

## CI/CD Pipeline

The CI/CD pipeline is configured to:

1. Install dependencies
2. Build all packages
3. Run linting
4. Run tests
5. Deploy to staging/production environments

## Migration Plan

The current plan is to gradually migrate the existing React application to the monorepo structure:

1. Extract shared logic to `packages/core`
2. Create Next.js app in `apps/web`
3. Migrate features one by one from `client` to `apps/web`
4. Develop mobile app in parallel using shared components

## Rules Compliance

This monorepo structure ensures compliance with the architectural mandates in `rules.md`:

- Monorepo with PNPM workspaces
- `packages/core` for platform-agnostic logic
- `packages/ui` for shared headless components
- `apps/web` for Next.js web app
- `apps/mobile` for React Native mobile app
- Shared TypeScript configurations
- Zustand for global state management
- React Query for server state
- React Hook Form with zod resolver
- Animation libraries: Framer Motion (web) and Reanimated (mobile)
