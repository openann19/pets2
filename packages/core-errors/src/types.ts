export type ErrorKind =
  | "Network"
  | "Auth"
  | "Validation"
  | "NotFound"
  | "RateLimit"
  | "Timeout"
  | "Internal"
  | "Unknown";

export interface AppError {
  kind: ErrorKind;
  message: string;
  cause?: unknown;
  code?: string | number;
  status?: number;
  retriable?: boolean;
  meta?: Record<string, unknown>;
}

