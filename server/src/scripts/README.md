# Seed Scripts

## seed-admin.ts

Creates admin accounts with different roles for testing.

### Usage

```bash
# From server directory
npx tsx src/scripts/seed-admin.ts
```

### What it creates

- **Superadmin** - Full access to all features
- **Support** - Read-only access to users, chats, billing, analytics
- **Moderator** - Content moderation capabilities
- **Finance** - Billing and payment management
- **Analyst** - Analytics and reporting access

### Credentials

After running, you'll see output with login credentials for each role.

## Environment

Make sure these environment variables are set:

- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)
