# @pawfectmatch/admin-core

Shared admin system for PawfectMatch web and mobile applications.

## Overview

This package provides a unified admin interface that works across both React (web) and React Native (mobile) platforms. It includes shared business logic, UI components, state management, and API services.

## Features

- **Cross-platform**: Works on both web and mobile
- **Unified API**: Single API service for all admin operations
- **Shared State**: Zustand-based state management
- **Type Safety**: Full TypeScript support
- **Modular Design**: Easy to extend and customize

## Installation

```bash
pnpm add @pawfectmatch/admin-core
```

## Usage

### Basic Setup

```typescript
import { getAdminAPI, useAdminStats, AdminDashboard } from '@pawfectmatch/admin-core';

// Initialize API (optional, defaults to '/api/admin')
const adminAPI = getAdminAPI();

// Use hooks in components
const StatsComponent = () => {
  const { stats, loading, error } = useAdminStats();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <AdminDashboard title="Admin Dashboard">
      <div>Total Users: {stats?.users.total}</div>
    </AdminDashboard>
  );
};
```

### Authentication

```typescript
import { useAdminAuth } from '@pawfectmatch/admin';

const AdminApp = () => {
  const { admin, isAuthenticated, login, logout, hasPermission } = useAdminAuth();

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div>
      {hasPermission('manage_users') && <UserManagement />}
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Data Management

```typescript
import { useAdminUsers, useAdminChats } from '@pawfectmatch/admin';

const UserManagement = () => {
  const { users, loading } = useAdminUsers({ page: 1, limit: 20 });
  const { chats } = useAdminChats({ status: 'active' });

  return (
    <div>
      <h2>Users ({users.length})</h2>
      <h2>Active Chats ({chats.length})</h2>
    </div>
  );
};
```

## API Reference

### Services

- `getAdminAPI()` - Get the admin API service instance
- `AdminAPIService` - Main API service class

### Hooks

- `useAdminAuth()` - Admin authentication state
- `useAdminStats()` - Dashboard statistics
- `useAdminUsers()` - User management
- `useAdminChats()` - Chat management
- `useAdminUploads()` - Content moderation
- `useAdminAnalytics()` - Analytics data
- `useAdminSecurity()` - Security alerts

### Components

- `AdminDashboard` - Main dashboard layout
- `AdminStatsCard` - Statistics display card
- `AdminTable` - Data table component
- `AdminNavigation` - Navigation component

### Types

All TypeScript types are exported for use in your applications.

## Architecture

### Platform Abstraction

The package uses conditional rendering and platform detection to provide the right components for each platform:

- **Web**: React components with CSS classes
- **Mobile**: React Native components with native styling

### State Management

Uses Zustand for lightweight, scalable state management that works across platforms.

### API Layer

Unified API service that handles authentication, error handling, and platform-specific adaptations.

## Development

```bash
# Install dependencies
pnpm install

# Build package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm typecheck
```

## Integration

### Web App Integration

```typescript
// In your Next.js app
import { AdminDashboard } from '@pawfectmatch/admin';

export default function AdminPage() {
  return (
    <AdminDashboard title="Admin Panel">
      {/* Your admin content */}
    </AdminDashboard>
  );
}
```

### Mobile App Integration

```typescript
// In your React Native app
import { AdminDashboard } from '@pawfectmatch/admin';

const AdminScreen = () => {
  return (
    <AdminDashboard title="Admin Panel">
      {/* Your admin content */}
    </AdminDashboard>
  );
};
```

## Contributing

1. Follow the existing patterns for cross-platform compatibility
2. Add TypeScript types for all new APIs
3. Include tests for new functionality
4. Update documentation

## License

MIT
