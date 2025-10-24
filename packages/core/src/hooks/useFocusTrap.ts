import { useEffect, useRef, useCallback } from 'react';
import { getDocumentObject } from '../utils/environment';

export function useFocusTrap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstFocusableElement = useRef<HTMLElement | null>(null);
  const lastFocusableElement = useRef<HTMLElement | null>(null);

  const handleTabKey = useCallback((e: KeyboardEvent) => {
    if (containerRef.current == null) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    firstFocusableElement.current = firstElement;
    lastFocusableElement.current = lastElement;

    const activeDocument = getDocumentObject();
    if (activeDocument == null) {
      return;
    }

    if (e.key === 'Tab' && !e.shiftKey && activeDocument.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }

    if (e.key === 'Tab' && e.shiftKey && activeDocument.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      handleTabKey(event);
    }
  }, [handleTabKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (container == null) return;

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element when trap is activated
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      const initialElement = focusableElements[0] as HTMLElement | undefined;
      if (initialElement != null) {
        initialElement.focus();
      }
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return containerRef;
}
