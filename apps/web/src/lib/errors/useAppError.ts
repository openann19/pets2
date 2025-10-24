import { E, type AppError } from "@core-errors";

export function toAppError(err: unknown, fallback?: Partial<AppError>): AppError {
  return E.fromUnknown(err, fallback);
}

