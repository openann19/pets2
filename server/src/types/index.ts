import { Request, Response, NextFunction } from 'express';
import { Socket } from 'socket.io';

// User Types
export interface User {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  bio?: string;
  dateOfBirth?: string;
  phone?: string;
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  photos: string[];
  primaryPhoto?: string;
  preferences: {
    ageRange: [number, number];
    maxDistance: number;
    species: string[];
  };
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Pet Types
export interface Pet {
  _id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'fish' | 'reptile' | 'other';
  breed: string;
  age: number;
  photos: string[];
  bio: string;
  owner: string; // User ID
  location?: {
    coordinates: [number, number];
    address?: string;
  };
  personality: string[];
  activityLevel: 'low' | 'medium' | 'high';
  size: 'small' | 'medium' | 'large';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Match Types
export interface Match {
  _id: string;
  users: [string, string]; // User IDs
  pets: [string, string]; // Pet IDs
  status: 'pending' | 'matched' | 'unmatched';
  compatibilityScore: number;
  createdAt: string;
  updatedAt: string;
}

// Message Types
export interface Message {
  _id: string;
  matchId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  timestamp: string;
  read: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

// AI Types
export interface AIAnalysis {
  breed: {
    primary: string;
    confidence: number;
  };
  health: {
    overall: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
    indicators: {
      coat: string;
      eyes: string;
      posture: string;
      energy: string;
    };
  };
  quality: {
    score: number;
    factors: {
      lighting: number;
      clarity: number;
      composition: number;
      expression: number;
    };
  };
  characteristics: {
    age: string;
    size: string;
    temperament: string[];
    features: string[];
  };
  suggestions: string[];
  tags: string[];
}

// Premium Types
export interface Subscription {
  _id: string;
  userId: string;
  plan: 'basic' | 'premium' | 'pro';
  status: 'active' | 'cancelled' | 'expired';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

// Support Types
export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  category: 'account' | 'matching' | 'premium' | 'technical' | 'safety' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface BugReport {
  id: string;
  userId: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  deviceInfo?: string;
  appVersion?: string;
  status: 'new' | 'investigating' | 'fixed' | 'wontfix';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
}

// Request/Response Types
export interface AuthenticatedRequest extends Request {
  userId: string;
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Socket Types
export interface SocketData {
  userId: string;
  roomId?: string;
}

export interface ChatMessage {
  matchId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'location';
  timestamp: string;
}

export interface TypingData {
  matchId: string;
  userId: string;
  isTyping: boolean;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Middleware Types
export interface AuthMiddleware {
  authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
  requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
}

// Controller Types
export interface Controller {
  [key: string]: (req: AuthenticatedRequest, res: Response) => Promise<void>;
}

// Route Types
export interface RouteHandler {
  (req: AuthenticatedRequest, res: Response, next?: NextFunction): Promise<void> | void;
}

// Database Types
export interface DatabaseConfig {
  uri: string;
  options: {
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
  };
}

// Environment Types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'staging' | 'production';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CLIENT_URL: string;
  AI_SERVICE_URL: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

// Swagger Types
export interface SwaggerConfig {
  definition: {
    openapi: string;
    info: {
      title: string;
      version: string;
      description: string;
    };
    servers: Array<{
      url: string;
      description: string;
    }>;
    components: {
      securitySchemes: {
        bearerAuth: {
          type: string;
          scheme: string;
          bearerFormat: string;
        };
      };
    };
  };
  apis: string[];
}

// Export all types
export type {
  Request,
  Response,
  NextFunction,
  Socket,
};
