'use client';
import React, { createContext, useContext, useRef, useState } from 'react';
// Dialog component - using alternative implementation
// import { Dialog } from '@pawfectmatch/ui/dist/components/Dialog';
// Using local dialog component instead
const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 z-50">
        {children}
      </div>
    </div>
  );
};
// Announcement Context
const AnnouncementContext = createContext();
export function useAnnouncement() {
    const context = useContext(AnnouncementContext);
    if (!context) {
        throw new Error('useAnnouncement must be used within an AnnouncementProvider');
    }
    return context;
}
export function AnnouncementProvider({ children }) {
    const [announcement, setAnnouncement] = useState('');
    const timeoutRef = useRef(null);
    const announce = (message, priority = 'polite') => {
        setAnnouncement({ message, priority });
        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        // Clear announcement after 5 seconds
        timeoutRef.current = setTimeout(() => {
            setAnnouncement('');
        }, 5000);
    };
    return (<AnnouncementContext.Provider value={{ announce, announcement }}>
      {children}
      {announcement && (<AriaLiveRegion priority={announcement.priority}>{announcement.message}</AriaLiveRegion>)}
    </AnnouncementContext.Provider>);
}
// Focus Management
export function useFocusManagement() {
    const lastFocusRef = useRef(null);
    const saveFocus = () => {
        lastFocusRef.current = document.activeElement;
    };
    const restoreFocus = () => {
        if (lastFocusRef.current && typeof lastFocusRef.current.focus === 'function') {
            lastFocusRef.current.focus();
        }
    };
    return { saveFocus, restoreFocus };
}
// Reduced Motion Hook
export function useReducedMotion() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(typeof window !== 'undefined'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false);
    React.useEffect(() => {
        if (typeof window === 'undefined')
            return;
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const listener = (event) => {
            setPrefersReducedMotion(event.matches);
        };
        mediaQuery.addEventListener('change', listener);
        return () => {
            mediaQuery.removeEventListener('change', listener);
        };
    }, []);
    return prefersReducedMotion;
}
// High Contrast Mode Hook
export function useHighContrastMode() {
    const [isHighContrast, setIsHighContrast] = useState(typeof window !== 'undefined'
        ? window.matchMedia('(forced-colors: active), (-ms-high-contrast: active)').matches
        : false);
    React.useEffect(() => {
        if (typeof window === 'undefined')
            return;
        const mediaQuery = window.matchMedia('(forced-colors: active), (-ms-high-contrast: active)');
        const listener = (event) => {
            setIsHighContrast(event.matches);
        };
        mediaQuery.addEventListener('change', listener);
        return () => {
            mediaQuery.removeEventListener('change', listener);
        };
    }, []);
    return isHighContrast;
}
// Accessible Components
export function AccessibleButton({ children, className = '', onClick, ariaLabel, ...props }) {
    return (<button className={className} onClick={onClick} aria-label={ariaLabel} {...props}>
      {children}
    </button>);
}
export function SkipLink({ href = '#main-content', children = 'Skip to main content' }) {
    return (<a href={href} className="absolute z-50 bg-blue-600 text-white p-3 -translate-y-full focus:translate-y-0 transition-transform">
      {children}
    </a>);
}
export function AriaLiveRegion({ children, priority = 'polite' }) {
    return (<div aria-live={priority} aria-atomic="true" className="sr-only">
      {children}
    </div>);
}
export function AccessibleModal({ isOpen, onClose, title, children, className = '' }) {
    return (<Dialog isOpen={isOpen} onClose={onClose} title={title} size="medium" variant="standard" animationPreset="scale" blurBackground={true} className={className}>
      {children}
    </Dialog>);
}
//# sourceMappingURL=AccessibilityUtils.jsx.map