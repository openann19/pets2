# Product Model, Navigation Graph, and API Contracts

## Product Model Overview
- **User** — Captures core identity, premium entitlements, contact details, and engagement analytics for every account. Each user record includes optional profile metadata (`bio`, `phone`, `preferences`, and `analytics`) so both mobile and web clients can hydrate personalization features without additional joins.【F:packages/core/src/types/models.ts†L6-L55】
- **Pet** — Represents adoptable or matchable animals with structured media attachments, availability flags, featured boosts, and lifecycle analytics, enabling consistent rendering across swipe, profile, and adoption flows.【F:packages/core/src/types/models.ts†L29-L79】
- **Match & Message** — `Match` links two pets and tracks activity, while `Message` models omnichannel chat events (text, voice, video, location, system) with attachment metadata, read receipts, and editing lifecycle fields to power real-time chat, history export, and offline queuing features.【F:packages/core/src/types/models.ts†L63-L115】
- **Compliance Entities** — Account deletion, subscription, notification, and adoption domain models remain typed for cross-platform reuse, ensuring privacy, billing, and shelter tools share a single contract.【F:packages/core/src/types/models.ts†L139-L338】

## Navigation Graph (Mobile)
- The React Navigation stack initializes with **Home** and exposes dedicated routes for **Swipe**, **Matches**, **Profile**, **Settings**, **MyPets**, **CreatePet**, **AdoptionManager**, and a tab-hosted **MainTabs** wrapper.【F:apps/mobile/src/App.tsx†L10-L38】
- SSL validation executes during app bootstrap to guarantee secure API connectivity before screens render, and the navigation container is wrapped with query, theme, and i18n providers so every route inherits data fetching, design tokens, and localization state by default.【F:apps/mobile/src/App.tsx†L40-L70】

## API Contracts
- **GDPR & Privacy** — Authenticated routes handle delete, export, confirm, and cancel flows with explicit validation middleware, mapping to the enhanced TypeScript types for account deletion grace periods and audit logging.【F:server/src/routes/gdpr.ts†L1-L33】【F:packages/core/src/types/account.ts†L1-L61】
- **Chat & Media** — Chat endpoints support history retrieval, message CRUD, reactions, search, statistics, export, and legacy compatibility, aligned with the expanded `Message` mapper that normalizes legacy payloads into rich media chat objects.【F:server/src/routes/chat.ts†L1-L64】【F:packages/core/src/mappers/message.ts†L42-L200】
- **Client API Infrastructure** — The unified API client combines circuit breaking, retries, offline queueing, and error classification so mobile and web share resilient request semantics when invoking the above contracts.【F:packages/core/src/api/UnifiedAPIClient.ts†L1-L214】【F:packages/core/src/api/OfflineQueueManager.ts†L1-L220】
