# Server TypeScript Migration Guide

## Overview

Complete migration of 140+ JavaScript files in `server/src/` to TypeScript with proper typing. This guide provides patterns, templates, and step-by-step instructions for incremental migration.

## Current Status

### Already Migrated ✅
- `src/middleware/auth.ts`
- `src/middleware/errorHandler.ts`
- `src/middleware/validation.ts`
- `src/types/index.ts`
- `src/utils/logger.ts`
- `src/routes/auth.ts`
- `src/routes/chat.ts`
- `src/routes/matches.ts`
- `src/routes/pets.ts`
- `src/routes/users.ts`
- `src/routes/support.ts`
- `server.ts` (main entry point)

### Remaining to Migrate (140+ files)
- **Models** (25 files): User, Pet, Match, Admin*, Analytics*, etc.
- **Controllers** (32 files): All controller files
- **Routes** (32 files): All route files
- **Services** (16 files): All service files
- **Middleware** (15 files): All middleware files
- **Utils** (5 files): All utility files
- **Config** (2 files): redis.js, sentry.js
- **Sockets** (4 files): WebSocket handlers
- **Schemas** (1 file): storySchemas.js

## Migration Phases

### Phase 1: Bulk File Rename (5 minutes)

```bash
# Navigate to repo root
cd /Users/elvira/Desktop/pets2

# Rename all JS files to TS (preserves content)
find server/src -name "*.js" -type f ! -path "*/dist/*" ! -path "*/tests/*" -exec sh -c 'mv "$1" "${1%.js}.ts"' _ {} \;

# Verify rename
find server/src -name "*.ts" -type f | wc -l  # Should show ~140+
```

### Phase 2: Type Definitions (1-2 hours)

Extend `/server/src/types/index.ts` with comprehensive interfaces:

```typescript
// Models
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // ... all fields
}

export interface IPet extends Document {
  ownerId: ObjectId;
  name: string;
  species: string;
  // ... all fields
}

// Controllers
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userId?: string;
  token?: string;
}

// Services
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface AnalyticsEvent {
  userId: string;
  eventType: string;
  timestamp: Date;
  data?: Record<string, any>;
}
```

### Phase 3: Models Migration (2-3 hours)

**Pattern Template:**

```typescript
import mongoose, { Document, Schema, ObjectId } from 'mongoose';

export interface IUser extends Document {
  _id: ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
  },
  { timestamps: true }
);

// Add indexes
userSchema.index({ email: 1 });

export default mongoose.model<IUser>('User', userSchema);
```

**Files to Migrate (Priority Order):**
1. User.ts, Pet.ts, Match.ts (core models)
2. Conversation.ts, Message.ts (if exists)
3. Admin* models (AdminActivityLog, AdminApiKey, etc.)
4. Analytics* models (AnalyticsEvent, etc.)
5. Remaining models (alphabetically)

### Phase 4: Controllers Migration (3-4 hours)

**Pattern Template:**

```typescript
import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';
import User from '../models/User';

export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.userId);
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
```

**Files to Migrate (Priority Order):**
1. authController.ts, userController.ts, petController.ts
2. Admin controllers (adminController.ts, AdminKYCController.ts, etc.)
3. Feature controllers (premiumController.ts, chatController.ts, etc.)
4. Remaining controllers (alphabetically)

### Phase 5: Routes Migration (2-3 hours)

**Pattern Template:**

```typescript
import { Router, Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import * as userController from '../controllers/userController';

const router = Router();

// Public routes
router.post('/login', validate.loginSchema, userController.login);

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validate.updateProfileSchema, userController.updateProfile);

export default router;
```

**Files to Migrate (Priority Order):**
1. auth.ts, users.ts, pets.ts (already done - reference)
2. admin.ts, premium.ts, analytics.ts
3. Remaining routes (alphabetically)

### Phase 6: Services Migration (1-2 hours)

**Pattern Template:**

```typescript
import nodemailer from 'nodemailer';
import { EmailOptions } from '../types';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    logger.info(`Email sent to ${options.to}`);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
  return sendEmail({
    to: email,
    subject: 'Welcome to PawfectMatch',
    html: `<h1>Welcome ${name}!</h1>`,
  });
};
```

**Files to Migrate:**
1. emailService.ts, analyticsService.ts, aiService.ts
2. Remaining services (alphabetically)

### Phase 7: Middleware & Utils Migration (1 hour)

**Middleware Pattern:**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  logger.info(`${req.method} ${req.path}`);
  next();
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error:', error);
  res.status(500).json({ success: false, error: error.message });
};
```

**Utils Pattern:**

```typescript
import crypto from 'crypto';

export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const hashPassword = async (password: string): Promise<string> => {
  // Implementation
  return password;
};
```

## Execution Steps

### Step 1: Prepare Environment
```bash
# Ensure TypeScript is installed
pnpm install

# Check current error count
pnpm --filter server exec tsc --noEmit 2>&1 | grep -c "error TS"
```

### Step 2: Bulk Rename Files
```bash
# Run the rename command from Phase 1
find server/src -name "*.js" -type f ! -path "*/dist/*" ! -path "*/tests/*" -exec sh -c 'mv "$1" "${1%.js}.ts"' _ {} \;
```

### Step 3: Extend Type Definitions
- Edit `/server/src/types/index.ts`
- Add all model interfaces
- Add all service types
- Add all controller types

### Step 4: Migrate by Category
- Start with models (highest impact)
- Then controllers
- Then routes
- Then services
- Finally middleware & utils

### Step 5: Verify & Fix
```bash
# Check for TypeScript errors
pnpm --filter server exec tsc --noEmit

# Run linter
pnpm --filter server lint

# Run tests
pnpm --filter server test
```

### Step 6: Clean Up
```bash
# Delete all remaining .js files
find server/src -name "*.js" -type f ! -path "*/dist/*" ! -path "*/tests/*" -delete

# Verify no .js files remain
find server/src -name "*.js" -type f | wc -l  # Should be 0
```

## Common Patterns

### Mongoose Model with Timestamps
```typescript
const schema = new Schema<IModel>(
  {
    field: { type: String, required: true },
  },
  { timestamps: true }
);
```

### Express Route with Validation
```typescript
router.post(
  '/endpoint',
  authenticate,
  validate.schemaName,
  controller.handler
);
```

### Async Controller Handler
```typescript
export const handler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Implementation
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error:', error);
    res.status(500).json({ success: false, error: 'message' });
  }
};
```

### Service Function with Error Handling
```typescript
export const serviceFunction = async (param: string): Promise<Result | null> => {
  try {
    // Implementation
    return result;
  } catch (error) {
    logger.error('Error:', error);
    return null;
  }
};
```

## Success Criteria

- ✅ All 140+ JS files renamed to TS
- ✅ All type definitions added to `/server/src/types/index.ts`
- ✅ Zero TypeScript compilation errors
- ✅ All imports updated to TS modules
- ✅ Server starts successfully with `pnpm --filter server dev`
- ✅ All routes functional
- ✅ All tests passing

## Estimated Timeline

- **Phase 1 (Rename):** 5 minutes
- **Phase 2 (Types):** 1-2 hours
- **Phase 3 (Models):** 2-3 hours
- **Phase 4 (Controllers):** 3-4 hours
- **Phase 5 (Routes):** 2-3 hours
- **Phase 6 (Services):** 1-2 hours
- **Phase 7 (Middleware/Utils):** 1 hour
- **Phase 8 (Verification):** 30 minutes

**Total: 12-18 hours of focused work**

## Notes

- This can be done incrementally - migrate one category at a time
- Run TypeScript compiler frequently to catch errors early
- Use the patterns provided as templates for consistency
- Keep error handling consistent across all files
- Maintain the same logging approach throughout

## Next Steps

1. Run bulk rename command
2. Extend type definitions
3. Start with models migration
4. Work through categories systematically
5. Verify and fix errors as you go
6. Clean up .js files when complete
