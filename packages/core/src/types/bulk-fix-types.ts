
// Auto-generated type definitions for bulk fixes
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
  success: boolean;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences?: Record<string, unknown>;
}

export interface PetData {
  id: string;
  name: string;
  breed: string;
  age: number;
  photos: string[];
  description: string;
  ownerId: string;
}

export interface Config {
  apiUrl: string;
  environment: 'development' | 'production' | 'test';
  features: Record<string, boolean>;
}

export interface Event {
  type: string;
  payload: unknown;
  timestamp: number;
}

export interface Callback {
  (): void;
}

export interface EventHandler {
  (event: Event): void;
}

export interface Options {
  [key: string]: unknown;
}

export interface Params {
  [key: string]: unknown;
}

export interface Result<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RequestParams {
  [key: string]: unknown;
}
