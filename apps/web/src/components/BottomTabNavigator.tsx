/**
 * Bottom Tab Navigator - Wrapper for ActivePillTabBar
 * Uses the new ActivePillTabBar component matching mobile navigation
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import ActivePillTabBar from './navigation/ActivePillTabBar';
import type { RouteName } from './navigation/ActivePillTabBar';

// Mock badge counts - replace with actual store/hook
const getBadgeCounts = (): Record<RouteName, number> => {
  // TODO: Replace with actual badge count logic from stores/hooks
  return {
    Home: 2,
    Swipe: 0,
    Matches: 3,
    Map: 1,
    Profile: 0,
    AdoptionManager: 0,
    Premium: 0,
  };
};

const BottomTabNavigator: React.FC = () => {
  const badgeCounts = getBadgeCounts();

  return (
    <>
      {/* Main content area */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation matching mobile ActivePillTabBar */}
      <ActivePillTabBar badgeCounts={badgeCounts} />
    </>
  );
};

export default BottomTabNavigator;
