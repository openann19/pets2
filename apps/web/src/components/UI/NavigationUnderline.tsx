/**
 * 🧭 NAVIGATION UNDERLINE COMPONENT
 * Smooth sliding underline animation for active navigation items
 */
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
export default function NavigationUnderline({ items, activeItem, variant = 'underline', size = 'md', className = '', onItemClick }) {
    const pathname = usePathname();
    const [activeId, setActiveId] = useState(activeItem || items[0]?.id);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const itemRefs = useRef({});
    // Determine active item based on pathname
    useEffect(() => {
        const currentItem = items.find(item => pathname.includes(item.href));
        if (currentItem) {
            setActiveId(currentItem.id);
        }
    }, [pathname, items]);
    // Update indicator position when active item changes
    useEffect(() => {
        const activeElement = itemRefs.current[activeId];
        if (activeElement) {
            const { offsetLeft, offsetWidth } = activeElement;
            setIndicatorStyle({
                left: offsetLeft,
                width: offsetWidth
            });
        }
    }, [activeId, items]);
    // Size variants
    const sizeClasses = {
        sm: {
            container: 'h-8',
            item: 'px-3 py-1 text-sm',
            indicator: 'h-0.5'
        },
        md: {
            container: 'h-10',
            item: 'px-4 py-2 text-base',
            indicator: 'h-1'
        },
        lg: {
            container: 'h-12',
            item: 'px-6 py-3 text-lg',
            indicator: 'h-1.5'
        }
    };
    // Variant styles
    const variantStyles = {
        underline: {
            indicator: `absolute bottom-0 bg-primary-500 ${sizeClasses[size].indicator}`,
            container: 'border-b border-neutral-200 dark:border-neutral-700'
        },
        pill: {
            indicator: `absolute bg-primary-500 rounded-full ${sizeClasses[size].indicator}`,
            container: 'bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1'
        },
        dot: {
            indicator: 'absolute -bottom-1 left-1/2 w-2 h-2 bg-primary-500 rounded-full transform -translate-x-1/2',
            container: ''
        }
    };
    const styles = sizeClasses[size];
    const variantStyle = variantStyles[variant];
    const handleItemClick = (item) => {
        setActiveId(item.id);
        onItemClick?.(item);
    };
    return (<nav className={`relative ${styles.container} ${variantStyle.container} ${className}`}>
      <div className="flex items-center h-full">
        {items.map((item) => (<button key={item.id} ref={(el) => (itemRefs.current[item.id] = el)} onClick={() => handleItemClick(item)} className={`
              ${styles.item}
              relative flex items-center space-x-2
              font-medium transition-colors duration-200
              ${activeId === item.id
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400'}
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              dark:focus:ring-offset-neutral-900
            `} aria-current={activeId === item.id ? 'page' : undefined}>
            {item.icon && (<span className="flex-shrink-0">
                {item.icon}
              </span>)}
            <span>{item.label}</span>
            {item.badge && item.badge > 0 && (<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="
                  inline-flex items-center justify-center
                  min-w-5 h-5 px-1.5
                  bg-error-500 text-white text-xs font-bold
                  rounded-full
                ">
                {item.badge > 99 ? '99+' : item.badge}
              </motion.span>)}
          </button>))}
      </div>

      {/* Animated indicator */}
      <AnimatePresence>
        <motion.div key={activeId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className={variantStyle.indicator} style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width
        }}/>
      </AnimatePresence>
    </nav>);
}
// Hook for navigation state management
export function useNavigation(items) {
    const pathname = usePathname();
    const [activeItem, setActiveItem] = useState(items[0]?.id);
    useEffect(() => {
        const currentItem = items.find(item => pathname.includes(item.href));
        if (currentItem) {
            setActiveItem(currentItem.id);
        }
    }, [pathname, items]);
    const setActive = (itemId) => {
        setActiveItem(itemId);
    };
    const getActiveItem = () => {
        return items.find(item => item.id === activeItem);
    };
    return {
        activeItem,
        setActive,
        getActiveItem,
        items
    };
}
// Predefined navigation items for common routes
export const NAVIGATION_ITEMS = {
    main: [
        {
            id: 'home',
            label: 'Home',
            href: '/',
            icon: <HomeIcon className="w-4 h-4"/>
        },
        {
            id: 'swipe',
            label: 'Swipe',
            href: '/swipe',
            icon: <HeartIcon className="w-4 h-4"/>
        },
        {
            id: 'matches',
            label: 'Matches',
            href: '/matches',
            icon: <ChatIcon className="w-4 h-4"/>
        },
        {
            id: 'chat',
            label: 'Chat',
            href: '/chat',
            icon: <ChatIcon className="w-4 h-4"/>
        },
        {
            id: 'profile',
            label: 'Profile',
            href: '/profile',
            icon: <UserIcon className="w-4 h-4"/>
        }
    ],
    admin: [
        {
            id: 'dashboard',
            label: 'Dashboard',
            href: '/admin',
            icon: <ChartBarIcon className="w-4 h-4"/>
        },
        {
            id: 'users',
            label: 'Users',
            href: '/admin/users',
            icon: <UsersIcon className="w-4 h-4"/>
        },
        {
            id: 'pets',
            label: 'Pets',
            href: '/admin/pets',
            icon: <HeartIcon className="w-4 h-4"/>
        },
        {
            id: 'analytics',
            label: 'Analytics',
            href: '/admin/analytics',
            icon: <ChartPieIcon className="w-4 h-4"/>
        }
    ]
};
// Import required icons
import { HomeIcon, HeartIcon, ChatBubbleLeftRightIcon as ChatIcon, UserIcon, ChartBarIcon, UsersIcon, ChartPieIcon } from '@heroicons/react/24/outline';
//# sourceMappingURL=NavigationUnderline.jsx.map