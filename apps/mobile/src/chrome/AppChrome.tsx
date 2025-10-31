/**
 * 🎯 APP CHROME - Wraps NavigationContainer with persistent SmartHeader
 * Listens to HeaderBus for screen updates, manages header state
 */

import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { useCapabilities } from '@/foundation/capabilities';
import { useAuthStore } from '@pawfectmatch/core';
import { usePremiumStatus } from '../hooks/domains/premium/usePremiumStatus';
import { SmartHeader } from './SmartHeader';
import { headerBus, type HeaderPayload } from './HeaderBus';
import type { HeaderContext } from './actions';

type Props = {
  children: React.ReactNode;
};

export default function AppChrome({ children }: Props) {
  const theme = useTheme() as AppTheme;
  const caps = useCapabilities();
  const { user } = useAuthStore();
  const { isPremium } = usePremiumStatus();

  // Determine user role from auth store
  const userRole = useMemo<'user' | 'premium' | 'admin'>(() => {
    if (!user) return 'user';
    const role = user.role || 'user';
    if (role === 'administrator' || role === 'moderator' || role === 'support') {
      return 'admin';
    }
    if (isPremium || role === 'premium') {
      return 'premium';
    }
    return 'user';
  }, [user, isPremium]);

  // Determine if new user (created in last 7 days)
  // Calculate in useEffect to avoid Date.now() in render
  const [isNewUser, setIsNewUser] = useState(false);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // setState in effect is intentional - we need to sync state when user.createdAt changes
  // This is the correct pattern for deriving state from props
  useEffect(() => {
    if (!user?.createdAt) {
      setIsNewUser(false);
      return;
    }
    const createdAt = new Date(user.createdAt);
    const now = Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    setIsNewUser((now - createdAt.getTime()) < sevenDaysInMs);
  }, [user?.createdAt]);

  const [title, setTitle] = useState('PawfectMatch');
  const [subtitle, setSubtitle] = useState<string | undefined>(undefined);
  const [scrollY, setScrollY] = useState<SharedValue<number> | undefined>(undefined);
  const [ctx, setCtx] = useState<HeaderContext>({
    route: 'Home',
    role: userRole,
    counts: {
      messages: 0,
      notifications: 0,
      community: 0,
    },
    caps: {
      highPerf: caps.highPerf,
      hdr: caps.hdr,
      skia: caps.skia,
      thermalsOk: caps.thermalsOk,
    },
    isNewUser,
  });

  useEffect(() => {
    const unsubscribe = headerBus.onUpdate((payload: HeaderPayload) => {
      if (payload.title !== undefined) setTitle(payload.title);
      if (payload.subtitle !== undefined) setSubtitle(payload.subtitle);
      if (payload.scrollY !== undefined) setScrollY(payload.scrollY);
      const patch = payload.ctxPatch;
      if (patch) {
        setCtx((prev) => ({
          ...prev,
          route: patch.route ?? prev.route,
          role: patch.role ?? prev.role ?? userRole,
          isNewUser: patch.isNewUser ?? prev.isNewUser ?? isNewUser,
          counts: patch.counts
            ? {
                ...prev.counts,
                ...patch.counts,
              }
            : prev.counts,
          caps: patch.caps
            ? {
                ...prev.caps,
                ...patch.caps,
              }
            : prev.caps,
        }));
      }
    });

    return unsubscribe;
  }, [userRole, isNewUser]);

  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <SmartHeader
        ctx={ctx}
        title={title}
        {...(scrollY !== undefined ? { scrollY } : {})}
        {...(subtitle !== undefined ? { subtitle } : {})}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    content: {
      flex: 1,
      paddingTop: 60, // Header height (SmartHeader is absolute positioned)
    },
  });

