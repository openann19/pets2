/**
 * Mobile Accessibility Utilities
 * Enhanced accessibility features for mobile devices including screen readers and keyboard navigation
 */
import { useEffect, useCallback, useRef, useState } from 'react'
import { logger } from '@pawfectmatch/core';
;
/**
 * Hook for managing mobile accessibility features
 */
export function useMobileAccessibility(config = {}) {
    const [state, setState] = useState({
        isScreenReaderActive: false,
        isKeyboardNavigationActive: false,
        isVoiceControlActive: false,
        isHighContrastMode: false,
        isReducedMotionMode: false,
        isLargeTextMode: false,
        currentFocusIndex: 0,
        focusableElements: [],
    });
    const focusableElementsRef = useRef([]);
    // Detect screen reader usage
    const detectScreenReader = useCallback(() => {
        // Check for screen reader indicators
        const hasScreenReader = window.speechSynthesis !== undefined ||
            'speechSynthesis' in window ||
            navigator.userAgent.includes('NVDA') ||
            navigator.userAgent.includes('JAWS') ||
            navigator.userAgent.includes('VoiceOver') ||
            document.querySelector('[aria-live]') !== null;
        setState(prev => ({ ...prev, isScreenReaderActive: hasScreenReader }));
    }, []);
    // Detect keyboard navigation
    const detectKeyboardNavigation = useCallback(() => {
        let isKeyboardActive = false;
        const handleKeyDown = (e) => {
            if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
                e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
                isKeyboardActive = true;
                setState(prev => ({ ...prev, isKeyboardNavigationActive: true }));
            }
        };
        const handleMouseDown = () => {
            isKeyboardActive = false;
            setState(prev => ({ ...prev, isKeyboardNavigationActive: false }));
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleMouseDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);
    // Detect voice control
    const detectVoiceControl = useCallback(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.onstart = () => {
                setState(prev => ({ ...prev, isVoiceControlActive: true }));
            };
            recognition.onend = () => {
                setState(prev => ({ ...prev, isVoiceControlActive: false }));
            };
            // Check if voice control is being used
            const checkVoiceControl = () => {
                try {
                    recognition.start();
                    setTimeout(() => recognition.stop(), 100);
                }
                catch (e) {
                    // Voice control not active
                }
            };
            return checkVoiceControl;
        }
    }, []);
    // Detect high contrast mode
    const detectHighContrast = useCallback(() => {
        const checkHighContrast = () => {
            const mediaQuery = window.matchMedia('(prefers-contrast: high)');
            setState(prev => ({ ...prev, isHighContrastMode: mediaQuery.matches }));
        };
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');
        mediaQuery.addEventListener('change', checkHighContrast);
        checkHighContrast();
        return () => { mediaQuery.removeEventListener('change', checkHighContrast); };
    }, []);
    // Detect reduced motion preference
    const detectReducedMotion = useCallback(() => {
        const checkReducedMotion = () => {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            setState(prev => ({ ...prev, isReducedMotionMode: mediaQuery.matches }));
        };
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        mediaQuery.addEventListener('change', checkReducedMotion);
        checkReducedMotion();
        return () => { mediaQuery.removeEventListener('change', checkReducedMotion); };
    }, []);
    // Detect large text preference
    const detectLargeText = useCallback(() => {
        const checkLargeText = () => {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const isLarge = fontSize > 16; // Default is usually 16px
            setState(prev => ({ ...prev, isLargeTextMode: isLarge }));
        };
        checkLargeText();
        window.addEventListener('resize', checkLargeText);
        return () => { window.removeEventListener('resize', checkLargeText); };
    }, []);
    // Update focusable elements
    const updateFocusableElements = useCallback(() => {
        const focusableSelectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])',
            '[role="button"]:not([disabled])',
            '[role="link"]',
            '[role="menuitem"]',
            '[role="option"]',
        ].join(', ');
        const elements = Array.from(document.querySelectorAll(focusableSelectors));
        focusableElementsRef.current = elements;
        setState(prev => ({ ...prev, focusableElements: elements }));
    }, []);
    // Initialize accessibility detection
    useEffect(() => {
        if (config.enableScreenReader !== false) {
            detectScreenReader();
        }
        if (config.enableKeyboardNavigation !== false) {
            const cleanup = detectKeyboardNavigation();
            return cleanup;
        }
    }, [config, detectScreenReader, detectKeyboardNavigation]);
    useEffect(() => {
        if (config.enableVoiceControl !== false) {
            const checkVoice = detectVoiceControl();
            if (checkVoice) {
                checkVoice();
            }
        }
        if (config.enableHighContrast !== false) {
            const cleanup = detectHighContrast();
            return cleanup;
        }
    }, [config, detectVoiceControl, detectHighContrast]);
    useEffect(() => {
        if (config.enableReducedMotion !== false) {
            const cleanup = detectReducedMotion();
            return cleanup;
        }
    }, [config, detectReducedMotion]);
    useEffect(() => {
        if (config.enableLargeText !== false) {
            const cleanup = detectLargeText();
            return cleanup;
        }
    }, [config, detectLargeText]);
    // Update focusable elements when DOM changes
    useEffect(() => {
        updateFocusableElements();
        const observer = new MutationObserver(updateFocusableElements);
        observer.observe(document.body, { childList: true, subtree: true });
        return () => { observer.disconnect(); };
    }, [updateFocusableElements]);
    return {
        state,
        updateFocusableElements,
    };
}
/**
 * Hook for keyboard navigation management
 */
export function useKeyboardNavigation() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const focusableElementsRef = useRef([]);
    const updateFocusableElements = useCallback(() => {
        const focusableSelectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])',
            '[role="button"]:not([disabled])',
            '[role="link"]',
            '[role="menuitem"]',
            '[role="option"]',
        ].join(', ');
        const elements = Array.from(document.querySelectorAll(focusableSelectors));
        focusableElementsRef.current = elements;
    }, []);
    const focusElement = useCallback((index) => {
        const elements = focusableElementsRef.current;
        if (elements[index]) {
            elements[index].focus();
            setCurrentIndex(index);
        }
    }, []);
    const handleKeyDown = useCallback((e) => {
        const elements = focusableElementsRef.current;
        if (elements.length === 0)
            return;
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % elements.length;
                focusElement(nextIndex);
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                const prevIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
                focusElement(prevIndex);
                break;
            case 'Home':
                e.preventDefault();
                focusElement(0);
                break;
            case 'End':
                e.preventDefault();
                focusElement(elements.length - 1);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (elements[currentIndex]) {
                    elements[currentIndex].click();
                }
                break;
        }
    }, [currentIndex, focusElement]);
    useEffect(() => {
        updateFocusableElements();
        const observer = new MutationObserver(updateFocusableElements);
        observer.observe(document.body, { childList: true, subtree: true });
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            observer.disconnect();
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [updateFocusableElements, handleKeyDown]);
    return {
        currentIndex,
        focusElement,
        updateFocusableElements,
    };
}
/**
 * Hook for screen reader announcements
 */
export function useScreenReaderAnnouncements() {
    const announceRef = useRef(null);
    const announce = useCallback((message, priority = 'polite') => {
        if (!announceRef.current) {
            // Create announcement element if it doesn't exist
            const element = document.createElement('div');
            element.setAttribute('aria-live', priority);
            element.setAttribute('aria-atomic', 'true');
            element.className = 'sr-only';
            element.style.position = 'absolute';
            element.style.left = '-10000px';
            element.style.width = '1px';
            element.style.height = '1px';
            element.style.overflow = 'hidden';
            document.body.appendChild(element);
            announceRef.current = element;
        }
        if (announceRef.current) {
            announceRef.current.textContent = message;
            // Clear the message after a short delay to allow re-announcement
            setTimeout(() => {
                if (announceRef.current) {
                    announceRef.current.textContent = '';
                }
            }, 1000);
        }
    }, []);
    const announcePageChange = useCallback((pageTitle) => {
        announce(`Navigated to ${pageTitle}`, 'assertive');
    }, [announce]);
    const announceError = useCallback((errorMessage) => {
        announce(`Error: ${errorMessage}`, 'assertive');
    }, [announce]);
    const announceSuccess = useCallback((successMessage) => {
        announce(`Success: ${successMessage}`, 'polite');
    }, [announce]);
    const announceLoading = useCallback((loadingMessage) => {
        announce(`Loading: ${loadingMessage}`, 'polite');
    }, [announce]);
    return {
        announce,
        announcePageChange,
        announceError,
        announceSuccess,
        announceLoading,
    };
}
/**
 * Hook for voice control integration
 */
export function useVoiceControl() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);
    const startListening = useCallback(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            recognition.onstart = () => {
                setIsListening(true);
            };
            recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    }
                    else {
                        interimTranscript += transcript;
                    }
                }
                setTranscript(finalTranscript || interimTranscript);
            };
            recognition.onerror = (event) => {
                logger.error('Speech recognition error:', { error: event.error });
                setIsListening(false);
            };
            recognition.onend = () => {
                setIsListening(false);
            };
            recognition.start();
            recognitionRef.current = recognition;
        }
    }, []);
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
    }, []);
    const clearTranscript = useCallback(() => {
        setTranscript('');
    }, []);
    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        clearTranscript,
    };
}
/**
 * Utility functions for accessibility enhancements
 */
export const accessibilityUtils = {
    // Add skip links for keyboard navigation
    addSkipLinks: () => {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#navigation" class="skip-link">Skip to navigation</a>
      <a href="#footer" class="skip-link">Skip to footer</a>
    `;
        const style = document.createElement('style');
        style.textContent = `
      .skip-links {
        position: absolute;
        top: -40px;
        left: 6px;
        z-index: 1000;
      }
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        transition: top 0.3s;
      }
      .skip-link:focus {
        top: 6px;
      }
    `;
        document.head.appendChild(style);
        document.body.insertBefore(skipLinks, document.body.firstChild);
    },
    // Enhance focus indicators
    enhanceFocusIndicators: () => {
        const style = document.createElement('style');
        style.textContent = `
      *:focus {
        outline: 2px solid #0066cc;
        outline-offset: 2px;
      }
      button:focus,
      [role="button"]:focus {
        outline: 3px solid #0066cc;
        outline-offset: 2px;
        box-shadow: 0 0 0 1px #fff, 0 0 0 4px #0066cc;
      }
      input:focus,
      textarea:focus,
      select:focus {
        outline: 2px solid #0066cc;
        outline-offset: 2px;
        box-shadow: 0 0 0 1px #0066cc;
      }
    `;
        document.head.appendChild(style);
    },
    // Add high contrast mode support
    addHighContrastSupport: () => {
        const style = document.createElement('style');
        style.textContent = `
      @media (prefers-contrast: high) {
        * {
          border-color: #000 !important;
        }
        .bg-gray-100 {
          background-color: #fff !important;
          color: #000 !important;
        }
        .text-gray-600 {
          color: #000 !important;
        }
        .border-gray-200 {
          border-color: #000 !important;
        }
      }
    `;
        document.head.appendChild(style);
    },
    // Add reduced motion support
    addReducedMotionSupport: () => {
        const style = document.createElement('style');
        style.textContent = `
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `;
        document.head.appendChild(style);
    },
    // Add large text support
    addLargeTextSupport: () => {
        const style = document.createElement('style');
        style.textContent = `
      @media (min-width: 1px) {
        html {
          font-size: clamp(16px, 4vw, 20px);
        }
        .text-sm {
          font-size: clamp(14px, 3.5vw, 18px);
        }
        .text-base {
          font-size: clamp(16px, 4vw, 20px);
        }
        .text-lg {
          font-size: clamp(18px, 4.5vw, 22px);
        }
      }
    `;
        document.head.appendChild(style);
    },
};
//# sourceMappingURL=mobile-accessibility.js.map