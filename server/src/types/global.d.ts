// Module declarations for missing @types packages
declare module 'swagger-jsdoc' {
  export default function swaggerJsdoc(options: any): any;
}

declare module 'swagger-ui-express' {
  export function serve(): any;
  export function setup(spec: any, options?: any): any;
}

declare module 'express-rate-limit' {
  export function ipKeyGenerator(req: any): string;
}

// Type augmentation for Express Request to include custom properties
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
      id?: string;
      stripeEventVerified?: boolean;
    }
  }
}
