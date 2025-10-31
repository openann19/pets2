import type { AppError, ErrorKind } from "./types";

export const E = {
  fromUnknown(err: unknown, fallback: Partial<AppError> = {}): AppError {
    if (isAppError(err)) return err;
    if (isAxiosError(err)) {
      const status = err.response?.status;
      const result: AppError = {
        kind: mapStatusToKind(status),
        message: err.message ?? "Request failed",
        cause: err,
        retriable: isRetriable(status),
        meta: { url: err.config?.url, method: err.config?.method }
      };
      if (status !== undefined) {
        result.status = status;
      }
      if (err.code !== undefined) {
        result.code = err.code;
      }
      return result;
    }
    if (err instanceof Error) {
      return { kind: "Unknown", message: err.message, cause: err, ...fallback };
    }
    return { kind: "Unknown", message: "Unknown error", cause: err, ...fallback };
  },

  make(kind: ErrorKind, message: string, init: Omit<AppError, "kind" | "message"> = {}): AppError {
    return { kind, message, ...init };
  }
} as const;

export function isAppError(x: unknown): x is AppError {
  return !!(x && typeof x === "object" && "kind" in (x as any) && "message" in (x as any));
}

function isAxiosError(x: unknown): x is {
  isAxiosError: true;
  message?: string;
  code?: string;
  response?: { status?: number };
  config?: { url?: string; method?: string };
} {
  return !!(x && typeof x === "object" && (x as any).isAxiosError);
}

function mapStatusToKind(s?: number): ErrorKind {
  if (!s) return "Unknown";
  if (s === 401 || s === 403) return "Auth";
  if (s === 404) return "NotFound";
  if (s === 408) return "Timeout";
  if (s === 429) return "RateLimit";
  if (s >= 500) return "Internal";
  return "Network";
}

function isRetriable(s?: number) {
  return !s || s >= 500 || s === 408 || s === 429;
}

