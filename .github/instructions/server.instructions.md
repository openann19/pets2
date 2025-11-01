---
applyTo:
  - 'server/**'
---

# Backend Server Instructions (Node.js + Express)

## Overview

The backend is built with Node.js (20+), Express.js, MongoDB (Mongoose), and Socket.io for real-time features. It provides RESTful APIs and WebSocket connections for the web and mobile clients.

## Architecture

```
server/
├── src/
│   ├── models/           # Mongoose models
│   ├── routes/           # Express routes
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Express middleware
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration
│   ├── types/            # TypeScript types
│   └── index.ts          # Entry point
├── tests/                # Tests
└── scripts/              # Utility scripts
```

## Express Best Practices

### Route Organization
```typescript
// routes/users.ts
import { Router } from 'express';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';
import { UserController } from '../controllers/UserController';

const router = Router();

router.get('/', authenticate, UserController.getAll);
router.get('/:id', authenticate, UserController.getById);
router.post('/', validateRequest(userSchema), UserController.create);
router.put('/:id', authenticate, validateRequest(userSchema), UserController.update);
router.delete('/:id', authenticate, UserController.delete);

export default router;
```

### Controller Pattern
```typescript
// controllers/UserController.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { AppError, ErrorCode } from '@pawfectmatch/core-errors';

export class UserController {
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserService.findById(id);
      
      if (!user) {
        throw new AppError({
          code: ErrorCode.NOT_FOUND,
          message: 'User not found',
          statusCode: 404,
        });
      }
      
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
```

### Service Layer
```typescript
// services/UserService.ts
import { User } from '../models/User';
import { UserCreateDTO, UserUpdateDTO } from '../types/dtos';

export class UserService {
  static async findById(id: string) {
    return await User.findById(id).select('-password');
  }
  
  static async create(data: UserCreateDTO) {
    const user = new User(data);
    await user.save();
    return user;
  }
  
  static async update(id: string, data: UserUpdateDTO) {
    return await User.findByIdAndUpdate(id, data, { new: true });
  }
  
  static async delete(id: string) {
    return await User.findByIdAndDelete(id);
  }
}
```

## MongoDB & Mongoose

### Model Definition
```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
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
    select: false, // Don't return password by default
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Indexes for performance
userSchema.index({ email: 1 });

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Pre-save hook
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const User = mongoose.model<IUser>('User', userSchema);
```

### Query Patterns
```typescript
// Find with conditions
const users = await User.find({ age: { $gte: 18 } })
  .select('name email')
  .limit(10)
  .sort({ createdAt: -1 });

// Populate references
const user = await User.findById(id)
  .populate('pets', 'name breed')
  .exec();

// Aggregation
const stats = await User.aggregate([
  { $match: { active: true } },
  { $group: { _id: '$location', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);

// Transactions
const session = await mongoose.startSession();
session.startTransaction();
try {
  await User.create([{ email: 'test@example.com' }], { session });
  await Pet.create([{ name: 'Buddy' }], { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

## Authentication & Authorization

### JWT Authentication
```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface JWTPayload {
  userId: string;
  email: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AppError({
        code: ErrorCode.UNAUTHORIZED,
        message: 'No token provided',
        statusCode: 401,
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = await User.findById(decoded.userId);
    
    if (!req.user) {
      throw new AppError({
        code: ErrorCode.UNAUTHORIZED,
        message: 'User not found',
        statusCode: 401,
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
};
```

### Role-Based Access Control
```typescript
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Not authenticated',
        statusCode: 401,
      });
    }
    
    if (!roles.includes(req.user.role)) {
      throw new AppError({
        code: ErrorCode.FORBIDDEN,
        message: 'Insufficient permissions',
        statusCode: 403,
      });
    }
    
    next();
  };
};

// Usage
router.delete('/users/:id', authenticate, authorize('admin'), UserController.delete);
```

## Input Validation

### Zod Validation Middleware
```typescript
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
        });
      } else {
        next(error);
      }
    }
  };
};

// Schema definition
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(50),
  age: z.number().min(18).max(120),
});

// Usage
router.post('/users', validateRequest(userSchema), UserController.create);
```

## Error Handling

### Global Error Handler
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@pawfectmatch/core-errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.details,
    });
  }
  
  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.message,
    });
  }
  
  // MongoDB duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate key error',
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
};

// Register in app
app.use(errorHandler);
```

## Socket.io Implementation

### Setup
```typescript
import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';

export const setupSocketIO = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', socket.data.userId);
    });
    
    socket.on('message', async (data) => {
      const { roomId, content } = data;
      const message = await MessageService.create({
        userId: socket.data.userId,
        roomId,
        content,
      });
      io.to(roomId).emit('message', message);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  return io;
};
```

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all routes
app.use('/api/', limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

app.use('/api/auth/login', authLimiter);
```

## Security Middleware

```typescript
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';

// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Prevent NoSQL injection
app.use(mongoSanitize());

// Body parser limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

## Testing

### Unit Tests
```typescript
import { UserService } from '../services/UserService';
import { User } from '../models/User';

jest.mock('../models/User');

describe('UserService', () => {
  describe('findById', () => {
    it('should return user when found', async () => {
      const mockUser = { _id: '123', email: 'test@example.com' };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      
      const result = await UserService.findById('123');
      
      expect(result).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith('123');
    });
    
    it('should return null when not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);
      
      const result = await UserService.findById('999');
      
      expect(result).toBeNull();
    });
  });
});
```

### Integration Tests
```typescript
import request from 'supertest';
import { app } from '../index';
import { connectDB, disconnectDB } from '../config/database';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('POST /api/users', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('test@example.com');
  });
  
  it('should return 400 for invalid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'invalid' });
    
    expect(response.status).toBe(400);
  });
});
```

## Environment Variables

Required variables in `.env`:
```
NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://localhost:27017/pawfectmatch
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Logging

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Usage
logger.info('Server started', { port: 5001 });
logger.error('Database connection failed', { error: err.message });
```

## Performance Optimization

### Database Indexing
```typescript
// Add indexes to frequently queried fields
userSchema.index({ email: 1 });
userSchema.index({ location: 1, age: 1 });

// Compound index for common queries
petSchema.index({ breed: 1, age: 1, location: 1 });
```

### Query Optimization
```typescript
// Select only needed fields
const users = await User.find().select('name email');

// Lean queries (returns plain JS objects)
const users = await User.find().lean();

// Limit and pagination
const users = await User.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

### Caching
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      redis.setex(key, duration, JSON.stringify(data));
      return originalJson(data);
    };
    
    next();
  };
};

// Usage
router.get('/matches', cacheMiddleware(300), MatchController.getAll);
```

## API Documentation

Use JSDoc comments for API documentation:
```typescript
/**
 * Get user by ID
 * @route GET /api/users/:id
 * @param {string} id - User ID
 * @returns {Promise<IUser>} User object
 * @throws {AppError} 404 if user not found
 */
static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Implementation
}
```

## Common Commands

```bash
pnpm --filter server dev        # Development mode
pnpm --filter server build      # Build TypeScript
pnpm --filter server start      # Production mode
pnpm --filter server test       # Run tests
pnpm --filter server test:cov   # With coverage
pnpm --filter server lint       # Lint code
```

## Quality Standards

- All endpoints must have authentication where needed
- Input validation on all POST/PUT requests
- Proper error handling with meaningful messages
- TypeScript strict mode (no `any`)
- Unit test coverage: 80%+
- API response time: <200ms for simple queries
- Database queries must use indexes for performance
