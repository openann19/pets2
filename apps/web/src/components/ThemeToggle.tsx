'use client';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../stores/theme';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
/**
 * A simple switch that toggles between the `glass` and `vibrant` display themes.
 *
 * Usage:
 *   <ThemeToggle />
 */
export default function ThemeToggle() {
    const { theme, toggle } = useThemeStore();
    const [mounted, setMounted] = useState(false);
    // Only render after hydration to avoid mismatch
    useEffect(() => {
        setMounted(true);
    }, []);
    // During SSR and initial client render, show default state
    if (!mounted) {
        return (<button type="button" className="relative z-50 inline-flex h-8 w-16 shrink-0 items-center rounded-full border border-white/40 backdrop-blur-sm shadow ring-1 ring-white/20 transition-colors bg-white/30" aria-label="Toggle theme">
        <span className="inline-block h-6 w-6 transform rounded-full bg-white shadow translate-x-1"/>
      </button>);
    }
    const enabled = theme === 'vibrant';
    return (<button type="button" onClick={toggle} aria-pressed={enabled} className={`relative z-50 inline-flex h-8 w-16 shrink-0 items-center rounded-full border border-white/40 backdrop-blur-sm shadow ring-1 ring-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${enabled ? 'bg-primary-500' : 'bg-white/30'}`}>
      <span className={`absolute left-1 flex items-center justify-center transition-opacity ${enabled ? 'opacity-0' : 'opacity-100'}`}>
        <MoonIcon className="h-4 w-4 text-gray-800"/>
      </span>
      <span className={`absolute right-1 flex items-center justify-center transition-opacity ${enabled ? 'opacity-100' : 'opacity-0'}`}>
        <SunIcon className="h-4 w-4 text-white"/>
      </span>
      <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-8' : 'translate-x-1'}`}/>
    </button>);
}
//# sourceMappingURL=ThemeToggle.jsx.map