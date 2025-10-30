/**
 * 🌍 LOCALE SWITCHER COMPONENT
 * Language selector with flag icons and smooth transitions
 */
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';
const DEFAULT_LOCALES = [
    {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        nativeName: 'English'
    },
    {
        code: 'bg',
        name: 'Bulgarian',
        flag: '🇧🇬',
        nativeName: 'Български'
    },
    {
        code: 'es',
        name: 'Spanish',
        flag: '🇪🇸',
        nativeName: 'Español'
    },
    {
        code: 'fr',
        name: 'French',
        flag: '🇫🇷',
        nativeName: 'Français'
    },
    {
        code: 'de',
        name: 'German',
        flag: '🇩🇪',
        nativeName: 'Deutsch'
    },
    {
        code: 'it',
        name: 'Italian',
        flag: '🇮🇹',
        nativeName: 'Italiano'
    },
    {
        code: 'pt',
        name: 'Portuguese',
        flag: '🇵🇹',
        nativeName: 'Português'
    },
    {
        code: 'ru',
        name: 'Russian',
        flag: '🇷🇺',
        nativeName: 'Русский'
    }
];
export default function LocaleSwitcher({ locales = DEFAULT_LOCALES, currentLocale = 'en', onLocaleChange, variant = 'dropdown', showFlags = true, showNativeNames = false, className = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLocale, setSelectedLocale] = useState(locales.find(locale => locale.code === currentLocale) || locales[0]);
    const dropdownRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, []);
    const handleLocaleChange = (locale) => {
        setSelectedLocale(locale);
        setIsOpen(false);
        if (onLocaleChange) {
            onLocaleChange(locale.code);
        }
        else {
            // Default Next.js locale switching
            const segments = pathname.split('/');
            if (segments[1] && locales.some(l => l.code === segments[1])) {
                // Replace existing locale
                segments[1] = locale.code;
            }
            else {
                // Add locale to path
                segments.splice(1, 0, locale.code);
            }
            const newPath = segments.join('/');
            router.push(newPath);
        }
    };
    // Variant styles
    const variantStyles = {
        dropdown: {
            container: 'relative',
            button: `
        flex items-center space-x-2 px-3 py-2
        bg-white dark:bg-neutral-800
        border border-neutral-200 dark:border-neutral-700
        rounded-lg hover:border-primary-300 dark:hover:border-primary-600
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-neutral-900
      `,
            dropdown: `
        absolute top-full left-0 mt-2
        bg-white dark:bg-neutral-800
        border border-neutral-200 dark:border-neutral-700
        rounded-lg shadow-lg
        min-w-48 max-h-64 overflow-y-auto
        z-50
      `
        },
        inline: {
            container: 'flex items-center space-x-4',
            button: `
        flex items-center space-x-2 px-2 py-1
        text-neutral-600 dark:text-neutral-400
        hover:text-primary-500 dark:hover:text-primary-400
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-neutral-900
      `,
            dropdown: `
        absolute top-full left-0 mt-2
        bg-white dark:bg-neutral-800
        border border-neutral-200 dark:border-neutral-700
        rounded-lg shadow-lg
        min-w-48 max-h-64 overflow-y-auto
        z-50
      `
        },
        compact: {
            container: 'relative',
            button: `
        p-2 rounded-full
        bg-neutral-100 dark:bg-neutral-800
        hover:bg-neutral-200 dark:hover:bg-neutral-700
        text-neutral-600 dark:text-neutral-400
        hover:text-primary-500 dark:hover:text-primary-400
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-neutral-900
      `,
            dropdown: `
        absolute top-full right-0 mt-2
        bg-white dark:bg-neutral-800
        border border-neutral-200 dark:border-neutral-700
        rounded-lg shadow-lg
        min-w-48 max-h-64 overflow-y-auto
        z-50
      `
        }
    };
    const styles = variantStyles[variant];
    return (<div ref={dropdownRef} className={`${styles.container} ${className}`}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.button} aria-label="Change language" aria-expanded={isOpen} aria-haspopup="true">
        {variant === 'compact' ? (<GlobeAltIcon className="w-5 h-5"/>) : (<>
            {showFlags && (<span className="text-lg" role="img" aria-label={selectedLocale.name}>
                {selectedLocale.flag}
              </span>)}
            <span className="text-sm font-medium">
              {showNativeNames ? selectedLocale.nativeName : selectedLocale.name}
            </span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}/>
          </>)}
      </button>

      <AnimatePresence>
        {isOpen && (<motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{
                type: "spring",
                stiffness: 400,
                damping: 25
            }} className={styles.dropdown}>
            {locales.map((locale) => (<motion.button key={locale.code} onClick={() => { handleLocaleChange(locale); }} className={`
                  w-full flex items-center space-x-3 px-4 py-3
                  text-left hover:bg-neutral-50 dark:hover:bg-neutral-700
                  transition-colors duration-150
                  ${selectedLocale.code === locale.code
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-neutral-700 dark:text-neutral-300'}
                `} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                {showFlags && (<span className="text-lg" role="img" aria-label={locale.name}>
                    {locale.flag}
                  </span>)}
                <div className="flex-1">
                  <div className="font-medium">
                    {showNativeNames ? locale.nativeName : locale.name}
                  </div>
                  {showNativeNames && locale.nativeName !== locale.name && (<div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {locale.name}
                    </div>)}
                </div>
                {selectedLocale.code === locale.code && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 bg-primary-500 rounded-full"/>)}
              </motion.button>))}
          </motion.div>)}
      </AnimatePresence>
    </div>);
}
// Hook for locale management
export function useLocale() {
    const [currentLocale, setCurrentLocale] = useState('en');
    const [availableLocales] = useState(DEFAULT_LOCALES);
    const changeLocale = (localeCode) => {
        setCurrentLocale(localeCode);
        // Store in localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('preferred-locale', localeCode);
        }
    };
    const getLocale = (code) => {
        return availableLocales.find(locale => locale.code === code);
    };
    const getCurrentLocale = () => {
        return getLocale(currentLocale) || availableLocales[0];
    };
    // Load saved locale on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLocale = localStorage.getItem('preferred-locale');
            if (savedLocale && availableLocales.some(l => l.code === savedLocale)) {
                setCurrentLocale(savedLocale);
            }
        }
    }, [availableLocales]);
    return {
        currentLocale,
        availableLocales,
        changeLocale,
        getLocale,
        getCurrentLocale
    };
}
//# sourceMappingURL=LocaleSwitcher.jsx.map