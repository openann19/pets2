/**
 * 🖼️ SCREEN SHELL - WEB VERSION
 * Universal layout wrapper matching mobile ScreenShell exactly
 * Provides: header space, safe areas, gradients, consistent spacing
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ScreenShellProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * ScreenShell - Universal screen wrapper for web
 *
 * Usage:
 * ```tsx
 * <ScreenShell header={<AdvancedHeader {...HeaderConfigs.glass()} />}>
 *   <YourContent />
 * </ScreenShell>
 * ```
 */
export function ScreenShell({ header, children, footer, className }: ScreenShellProps) {
  return (
    <div className={cn("min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-purple-50/30", className)}>
      {header && (
        <div className="sticky top-0 z-50">
          {header}
        </div>
      )}
      <main className="flex-1 px-6 lg:px-8 py-6">
        {children}
      </main>
      {footer && (
        <footer>
          {footer}
        </footer>
      )}
    </div>
  );
}

