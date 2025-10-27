/**
 * Environment variable types
 * This file ensures type safety for process.env
 */
export interface IEnvVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT?: string;
  MONGODB_URI: string;
  MONGODB_TEST_URI?: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRY?: string;
  JWT_REFRESH_EXPIRY?: string;
  JWT_EXPIRE?: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  SENDGRID_API_KEY?: string;
  SENTRY_DSN?: string;
  REDIS_URL?: string;
  REDIS_HOST?: string;
  REDIS_PORT?: string;
  REDIS_PASSWORD?: string;
  CLIENT_URL: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  OPENAI_API_KEY?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  AWS_REGION?: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  CLOUDINARY_CLOUD?: string;
  CLOUDINARY_KEY?: string;
  CLOUDINARY_SECRET?: string;
  FCM_SERVER_KEY?: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends IEnvVariables {}
  }
}

