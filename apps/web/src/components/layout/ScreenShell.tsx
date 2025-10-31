/**
 * 🖼️ SCREEN SHELL - UNIVERSAL LAYOUT
 * Every screen MUST use this wrapper
 * Provides: header space, safe areas, gradients, consistent spacing
 * Web adaptation matching mobile ScreenShell exactly
 */

'use client';

import React from 'react';
import { useTheme } from '@/theme';
import { cn } from '@/lib/utils';

export interface ScreenShellProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * ScreenShell - Universal screen wrapper
 *
 * Usage:
 * ```tsx
 * <ScreenShell header={<AdvancedHeader {...HeaderConfigs.glass()} />}>
 *   <YourContent />
 * </ScreenShell>
 * ```
 */
export function ScreenShell({ header, children, footer, className }: ScreenShellProps) {
  const theme = useTheme();
  
  // Create gradient from surface to primary with 10% opacity
  const gradientFrom = theme.colors.surface;
  const gradientTo = `${theme.colors.primary}1A`; // 10% opacity in hex (1A = ~10%)
  
  return (
    <div 
      className={cn(
        "min-h-screen flex flex-col relative",
        className
      )}
      style={{
        backgroundColor: theme.colors.bg,
      }}
    >
      {/* Gradient background matching mobile LinearGradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        }}
      />
      
      {/* Safe area wrapper with theme spacing */}
      <div 
        className="flex flex-col flex-1 relative z-10"
        style={{
          paddingLeft: theme.spacing.xl,
          paddingRight: theme.spacing.xl,
        }}
      >
        {header && (
          <div className="relative z-20">
            {header}
          </div>
        )}
        
        <main 
          className="flex-1"
          style={{
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.xl,
          }}
        >
          {children}
        </main>
        
        {footer && (
          <footer className="relative z-20">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

