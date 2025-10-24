'use client';
import { Component, type ReactNode } from "react";
import { E, type AppError } from "@shared/errors";

type Props = { children: ReactNode; onError?: (e: AppError) => void; fallback?: ReactNode };
type State = { hasError: boolean; error?: AppError };

export class WebErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };
  static getDerivedStateFromError(e: unknown): State {
    return { hasError: true, error: E.fromUnknown(e) };
  }
  override componentDidCatch(error: unknown) {
    const appErr = E.fromUnknown(error);
    this.props.onError?.(appErr);
    // TODO: route to your logger/telemetry
  }
  override render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

