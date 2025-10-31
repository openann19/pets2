/**
 * 🎯 ACTIVE PILL TAB BAR - WEB VERSION
 * Bottom tab navigation matching mobile ActivePillTabBar exactly
 * Features: animated pill indicator, badge counts, haptic-like feedback, glass morphism
 */

'use client';

import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  UserCircleIcon,
  SparklesIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  HeartIcon as HeartIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  MapPinIcon as MapPinIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  SparklesIcon as SparklesIconSolid,
  ListBulletIcon as ListBulletIconSolid,
} from '@heroicons/react/24/solid';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { cn } from '@/lib/utils';

export type RouteName = 'Home' | 'Swipe' | 'Map' | 'Matches' | 'Profile' | 'AdoptionManager' | 'Premium';

interface TabRoute {
  name: RouteName;
  path: string;
  label?: string;
}

const ICONS: Record<RouteName, { focused: React.ComponentType<{ className?: string }>; unfocused: React.ComponentType<{ className?: string }> }> = {
  Home: { focused: HomeIconSolid, unfocused: HomeIcon },
  Swipe: { focused: HeartIconSolid, unfocused: HeartIcon },
  Map: { focused: MapPinIconSolid, unfocused: MapPinIcon },
  Matches: { focused: ChatBubbleLeftRightIconSolid, unfocused: ChatBubbleLeftRightIcon },
  Profile: { focused: UserCircleIconSolid, unfocused: UserCircleIcon },
  AdoptionManager: { focused: ListBulletIconSolid, unfocused: ListBulletIcon },
  Premium: { focused: SparklesIconSolid, unfocused: SparklesIcon },
};

const DEFAULT_ROUTES: TabRoute[] = [
  { name: 'Home', path: '/' },
  { name: 'Swipe', path: '/swipe' },
  { name: 'Matches', path: '/matches' },
  { name: 'Map', path: '/map' },
  { name: 'Profile', path: '/profile' },
];

interface ActivePillTabBarProps {
  routes?: TabRoute[];
  badgeCounts?: Record<RouteName, number>;
  onTabPress?: (routeName: RouteName) => void;
  onTabDoublePress?: (routeName: RouteName) => void;
  className?: string;
}

// Badge Animation Component
function BadgeAnimation({ count, theme }: { count: number; theme: AppTheme }) {
  return (
    <motion.div
      className="absolute -top-1.5 -right-3 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2"
      style={{
        backgroundColor: theme.colors.danger,
        borderColor: theme.colors.surface,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
    >
      <span
        className="text-[10px] font-bold"
        style={{ color: theme.colors.surface }}
      >
        {count > 99 ? '99+' : count}
      </span>
    </motion.div>
  );
}

// Tab Item Component
function TabItem({
  route,
  isFocused,
  badgeCount,
  scaleMotionValue,
  theme,
  onPress,
  onDoublePress,
  onLayout,
}: {
  route: TabRoute;
  isFocused: boolean;
  badgeCount: number;
  scaleMotionValue: ReturnType<typeof useMotionValue<number>>;
  theme: AppTheme;
  onPress: () => void;
  onDoublePress: () => void;
  onLayout: (layout: { x: number; width: number }) => void;
}) {
  const iconRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  const IconComponent = isFocused ? ICONS[route.name].focused : ICONS[route.name].unfocused;
  const iconColor = isFocused ? theme.colors.primary : theme.colors.onMuted;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    const delta = now - lastTapRef.current;
    lastTapRef.current = now;

    if (isFocused && delta < 300) {
      onDoublePress();
    } else {
      onPress();
    }
  }, [isFocused, onPress, onDoublePress]);

  useEffect(() => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const parent = iconRef.current.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        onLayout({
          x: rect.left - parentRect.left,
          width: rect.width,
        });
      }
    }
  }, [isFocused, onLayout]);

  // Trigger haptic-like feedback
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(8);
    }
  }, []);

  return (
    <Link
      to={route.path}
      onClick={(e) => {
        handleClick(e);
        triggerHaptic();
      }}
      className={cn(
        'flex-1 h-14 flex items-center justify-center relative',
        'transition-all duration-200'
      )}
      aria-label={`${route.name} tab`}
      aria-selected={isFocused}
    >
      <div
        ref={iconRef}
        className="relative flex items-center justify-center"
      >
        <motion.div
          style={{
            scale: scaleMotionValue,
          }}
        >
          <IconComponent className="w-6 h-6" style={{ color: iconColor }} />
        </motion.div>
        {badgeCount > 0 && (
          <BadgeAnimation count={badgeCount} theme={theme} />
        )}
      </div>
    </Link>
  );
}

export default function ActivePillTabBar({
  routes = DEFAULT_ROUTES,
  badgeCounts = {},
  onTabPress,
  onTabDoublePress,
  className,
}: ActivePillTabBarProps) {
  const theme = useTheme() as AppTheme;
  const location = useLocation();
  const navigate = useNavigate();
  const dark = theme.isDark;

  // Find active route
  const activeIndex = routes.findIndex(
    (route) => location.pathname === route.path || location.pathname.startsWith(route.path + '/')
  );
  const activeRoute = activeIndex >= 0 ? routes[activeIndex] : routes[0];
  const isActive = activeIndex >= 0;

  // Pill indicator animation
  const [layouts, setLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const indicatorX = useMotionValue(0);
  const indicatorW = useMotionValue(60);
  const springX = useSpring(indicatorX, { stiffness: 300, damping: 30 });
  const springW = useSpring(indicatorW, { stiffness: 300, damping: 30 });

  // Icon scales for each tab
  const iconScales = useMemo(
    () => routes.map(() => useMotionValue(1)),
    [routes.length]
  );

  // Update indicator position when active route changes
  useEffect(() => {
    if (activeRoute && layouts[activeRoute.name]) {
      const layout = layouts[activeRoute.name];
      indicatorX.set(layout.x);
      indicatorW.set(layout.width);
    }
  }, [activeRoute?.name, layouts, indicatorX, indicatorW]);

  // Bounce active icon
  useEffect(() => {
    if (activeIndex >= 0 && activeIndex < iconScales.length) {
      const scale = iconScales[activeIndex];
      scale.set(1.15);
      scale.set(1);
    }
  }, [activeIndex, iconScales]);

  const handleTabLayout = useCallback((routeName: RouteName, layout: { x: number; width: number }) => {
    setLayouts((prev) => ({
      ...prev,
      [routeName]: layout,
    }));
  }, []);

  const handleTabPress = useCallback((route: TabRoute) => {
    if (onTabPress) {
      onTabPress(route.name);
    }
    navigate(route.path);
    
    // Bounce animation
    const index = routes.indexOf(route);
    if (index >= 0 && index < iconScales.length) {
      const scale = iconScales[index];
      scale.set(0.9);
      scale.set(1);
    }
  }, [routes, navigate, onTabPress, iconScales]);

  const handleTabDoublePress = useCallback((route: TabRoute) => {
    if (onTabDoublePress) {
      onTabDoublePress(route.name);
    }
  }, [onTabDoublePress]);

  const getBadgeCount = (routeName: RouteName): number => {
    return badgeCounts[routeName] ?? 0;
  };

  // Pill background color
  const pillBg = dark
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(0, 0, 0, 0.06)';

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'pb-safe-area-inset-bottom',
        className
      )}
      style={{
        paddingTop: theme.spacing.sm,
        backgroundColor: dark ? theme.colors.bg : 'transparent',
      }}
    >
      {/* Glass morphism bar */}
      <div
        className="mx-3 h-16 rounded-2xl overflow-hidden border flex flex-row items-center px-1.5 relative"
        style={{
          borderColor: theme.colors.border,
          backdropFilter: 'blur(80px)',
          WebkitBackdropFilter: 'blur(80px)',
          backgroundColor: dark
            ? 'rgba(0, 0, 0, 0.4)'
            : 'rgba(255, 255, 255, 0.7)',
        }}
      >
        {/* Active pill indicator */}
        {isActive && (
          <motion.div
            className="absolute h-12 rounded-xl"
            style={{
              backgroundColor: pillBg,
              x: springX,
              width: springW,
            }}
            layoutId="pill"
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
          />
        )}

        {/* Tab items */}
        {routes.map((route, index) => {
          const isFocused = activeIndex === index;
          const badgeCount = getBadgeCount(route.name);

          return (
            <TabItem
              key={route.name}
              route={route}
              isFocused={isFocused}
              badgeCount={badgeCount}
              scaleMotionValue={iconScales[index]}
              theme={theme}
              onPress={() => handleTabPress(route)}
              onDoublePress={() => handleTabDoublePress(route)}
              onLayout={(layout) => handleTabLayout(route.name, layout)}
            />
          );
        })}
      </div>
    </div>
  );
}

