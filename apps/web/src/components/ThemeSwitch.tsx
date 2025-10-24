'use client';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
export function ThemeSwitch() {
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return (<div className="rounded-full p-2 w-10 h-10 bg-neutral-200 dark:bg-neutral-700 animate-pulse"/>);
    }
    const currentTheme = theme === 'system' ? systemTheme : theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    return (<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="rounded-full p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200" onClick={() => setTheme(nextTheme)} aria-label={`Switch to ${nextTheme} theme`} title={`Switch to ${nextTheme} theme`}>
      {currentTheme === 'dark' ? (<SunIcon className="h-5 w-5 text-yellow-500"/>) : (<MoonIcon className="h-5 w-5 text-blue-600"/>)}
    </motion.button>);
}
// Advanced theme selector with system option
export function ThemeSelector() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return (<div className="flex gap-2">
        <div className="rounded-full p-2 w-10 h-10 bg-neutral-200 dark:bg-neutral-700 animate-pulse"/>
        <div className="rounded-full p-2 w-10 h-10 bg-neutral-200 dark:bg-neutral-700 animate-pulse"/>
        <div className="rounded-full p-2 w-10 h-10 bg-neutral-200 dark:bg-neutral-700 animate-pulse"/>
      </div>);
    }
    const themes = [
        { value: 'light', icon: SunIcon, label: 'Light' },
        { value: 'dark', icon: MoonIcon, label: 'Dark' },
        { value: 'system', icon: ComputerDesktopIcon, label: 'System' },
    ];
    return (<div className="flex gap-2">
      {themes.map(({ value, icon: Icon, label }) => (<motion.button key={value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`rounded-full p-2 transition-colors duration-200 ${theme === value
                ? 'bg-primary-500 text-white'
                : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'}`} onClick={() => setTheme(value)} aria-label={`Switch to ${label} theme`} title={`Switch to ${label} theme`}>
          <Icon className="h-5 w-5"/>
        </motion.button>))}
    </div>);
}
//# sourceMappingURL=ThemeSwitch.jsx.map