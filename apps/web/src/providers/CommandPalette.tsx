'use client';
import { KBarProvider, KBarPortal, KBarPositioner, KBarAnimator, KBarSearch, KBarResults, useMatches } from 'kbar'
import { logger } from '@pawfectmatch/core';
;
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ReactNode, useEffect } from 'react';
import { HomeIcon, UserIcon, HeartIcon, ChatBubbleLeftRightIcon, Cog6ToothIcon, SunIcon, MoonIcon, ArrowRightOnRectangleIcon, MagnifyingGlassIcon, PlusIcon, BellIcon } from '@heroicons/react/24/outline';
// Command actions
function useActions() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    return [
        // Navigation
        {
            id: 'home',
            name: 'Home',
            shortcut: ['g', 'h'],
            keywords: 'home dashboard main',
            icon: <HomeIcon className="h-5 w-5"/>,
            perform: () => router.push('/'),
        },
        {
            id: 'discover',
            name: 'Discover Pets',
            shortcut: ['g', 'd'],
            keywords: 'discover pets swipe match',
            icon: <HeartIcon className="h-5 w-5"/>,
            perform: () => router.push('/discover'),
        },
        {
            id: 'matches',
            name: 'My Matches',
            shortcut: ['g', 'm'],
            keywords: 'matches connections',
            icon: <HeartIcon className="h-5 w-5"/>,
            perform: () => router.push('/matches'),
        },
        {
            id: 'chat',
            name: 'Chat',
            shortcut: ['g', 'c'],
            keywords: 'chat messages conversations',
            icon: <ChatBubbleLeftRightIcon className="h-5 w-5"/>,
            perform: () => router.push('/chat'),
        },
        {
            id: 'profile',
            name: 'My Profile',
            shortcut: ['g', 'p'],
            keywords: 'profile account settings',
            icon: <UserIcon className="h-5 w-5"/>,
            perform: () => router.push('/profile'),
        },
        {
            id: 'notifications',
            name: 'Notifications',
            shortcut: ['g', 'n'],
            keywords: 'notifications alerts',
            icon: <BellIcon className="h-5 w-5"/>,
            perform: () => router.push('/notifications'),
        },
        {
            id: 'add-pet',
            name: 'Add Pet',
            shortcut: ['a', 'p'],
            keywords: 'add pet create new',
            icon: <PlusIcon className="h-5 w-5"/>,
            perform: () => router.push('/pets/new'),
        },
        {
            id: 'search',
            name: 'Search',
            shortcut: ['/'],
            keywords: 'search find',
            icon: <MagnifyingGlassIcon className="h-5 w-5"/>,
            perform: () => {
                // Focus search input if available
                const searchInput = document.querySelector('input[type="search"]');
                if (searchInput) {
                    searchInput.focus();
                }
            },
        },
        // Theme actions
        {
            id: 'theme',
            name: 'Toggle Theme',
            shortcut: ['t'],
            keywords: 'theme dark light mode',
            icon: theme === 'dark' ? <SunIcon className="h-5 w-5"/> : <MoonIcon className="h-5 w-5"/>,
            perform: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
        },
        // Settings
        {
            id: 'settings',
            name: 'Settings',
            shortcut: ['s'],
            keywords: 'settings preferences config',
            icon: <Cog6ToothIcon className="h-5 w-5"/>,
            perform: () => router.push('/settings'),
        },
        // Account actions
        {
            id: 'logout',
            name: 'Logout',
            shortcut: ['l'],
            keywords: 'logout sign out exit',
            icon: <ArrowRightOnRectangleIcon className="h-5 w-5"/>,
            perform: () => {
                // Handle logout logic
                logger.info('Logout triggered from command palette');
                // You can dispatch a logout action here
            },
        },
    ];
}
// Results component for custom styling
function RenderResults() {
    const { results } = useMatches();
    return (<KBarResults items={results} onRender={({ item, active }) => (<div className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${active
                ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100'
                : 'text-neutral-700 dark:text-neutral-300'}`}>
          <div className="flex-shrink-0">
            {typeof item.icon === 'string' ? (<div className="h-5 w-5 bg-neutral-300 dark:bg-neutral-600 rounded"/>) : (item.icon)}
          </div>
          <div className="flex-1">
            <div className="font-medium">{item.name}</div>
            {item.subtitle && (<div className="text-sm text-neutral-500 dark:text-neutral-400">
                {item.subtitle}
              </div>)}
          </div>
          {item.shortcut && (<div className="flex gap-1">
              {item.shortcut.map((key) => (<kbd key={key} className="px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 rounded">
                  {key}
                </kbd>))}
            </div>)}
        </div>)}/>);
}
export function CommandPalette({ children }) {
    const actions = useActions();
    // Listen for custom events to trigger theme toggle
    useEffect(() => {
        const handleThemeToggle = () => {
            const themeAction = actions.find(action => action.id === 'theme');
            if (themeAction) {
                themeAction.perform();
            }
        };
        document.addEventListener('toggle-theme', handleThemeToggle);
        return () => document.removeEventListener('toggle-theme', handleThemeToggle);
    }, [actions]);
    return (<KBarProvider actions={actions}>
      {children}
      <KBarPortal>
        <KBarPositioner className="z-[200] bg-black/50 backdrop-blur-sm">
          <KBarAnimator className="bg-white dark:bg-neutral-800 w-[600px] max-w-full rounded-xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
            <KBarSearch className="w-full p-4 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 outline-none text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400" placeholder="Type a command or search..."/>
            <div className="max-h-96 overflow-y-auto">
              <RenderResults />
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">
                      ↑↓
                    </kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">
                      ↵
                    </kbd>
                    <span>Select</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-xs">
                      esc
                    </kbd>
                    <span>Close</span>
                  </div>
                </div>
                <div>PawfectMatch Command Palette</div>
              </div>
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
    </KBarProvider>);
}
// Hook to programmatically trigger command palette
export function useCommandPalette() {
    const triggerCommand = (commandId) => {
        // This would need to be implemented with KBar's internal API
        // For now, we'll dispatch a custom event
        document.dispatchEvent(new CustomEvent('kbar-trigger', { detail: { commandId } }));
    };
    return { triggerCommand };
}
// Export command palette trigger function
export function triggerCommandPalette() {
    // This would open the command palette
    // Implementation depends on KBar's internal API
    document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true, // Cmd on Mac
        ctrlKey: true, // Ctrl on Windows/Linux
    }));
}
//# sourceMappingURL=CommandPalette.jsx.map