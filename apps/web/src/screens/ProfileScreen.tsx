/**
 * ProfileScreen - WEB VERSION
 * User profile management matching mobile ProfileScreen structure
 */

'use client';

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ScreenShell } from '@/components/layout/ScreenShell';
import { AdvancedHeader, HeaderConfigs } from '@/components/layout/AdvancedHeader';
import { useTheme } from '@/theme';
import { useAuthStore } from '@pawfectmatch/core';
import { Card } from '@/components/UI/Card';
import { Button } from '@/components/UI/Button';

export default function ProfileScreen() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { user, logout } = useAuthStore();

  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    email: true,
    push: true,
  });

  const [privacy, setPrivacy] = useState({
    showLocation: true,
    showAge: true,
    showBreed: true,
  });

  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout?.();
      navigate('/login');
    }
  }, [logout, navigate]);

  const handleSettingToggle = useCallback((setting: string) => {
    setNotifications((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  }, []);

  const handlePrivacyToggle = useCallback((setting: string) => {
    setPrivacy((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  }, []);

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: t('profile.title') || 'Profile',
            ...(user?.firstName && {
              subtitle: `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`,
            }),
            showBackButton: true,
            onBackPress: () => navigate(-1),
          })}
        />
      }
    >
      <div
        style={{
          padding: theme.spacing.lg,
        }}
      >
        {/* Profile Header */}
        <Card padding="xl" radius="md" shadow="elevation2" tone="surface" style={{ marginBottom: theme.spacing.lg }}>
          <div className="text-center">
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: theme.radii.full,
                backgroundColor: theme.colors.primary,
                margin: '0 auto',
                marginBottom: theme.spacing.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.colors.onPrimary,
                fontSize: theme.typography.h2.size,
                fontWeight: 'bold',
              }}
            >
              {user?.firstName?.[0] || 'U'}
            </div>
            <h2
              style={{
                fontSize: theme.typography.h2.size,
                fontWeight: 'bold',
                color: theme.colors.onSurface,
                marginBottom: theme.spacing.xs,
              }}
            >
              {user?.firstName || 'User'} {user?.lastName || ''}
            </h2>
            {user?.email && (
              <p
                style={{
                  color: theme.colors.onMuted,
                  fontSize: theme.typography.body.size,
                }}
              >
                {user.email}
              </p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card padding="md" radius="md" shadow="elevation1" tone="surface" style={{ marginBottom: theme.spacing.lg }}>
          <h3
            style={{
              fontSize: theme.typography.h2.size * 0.8,
              fontWeight: '600',
              color: theme.colors.onSurface,
              marginBottom: theme.spacing.md,
            }}
          >
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            <Button
              title="My Pets"
              variant="secondary"
              onPress={() => navigate('/my-pets')}
            />
            <Button
              title="Settings"
              variant="secondary"
              onPress={() => navigate('/settings')}
            />
            <Button
              title="Create Pet"
              variant="primary"
              onPress={() => navigate('/create-pet')}
            />
          </div>
        </Card>

        {/* Notifications */}
        <Card padding="md" radius="md" shadow="elevation1" tone="surface" style={{ marginBottom: theme.spacing.lg }}>
          <h3
            style={{
              fontSize: theme.typography.h2.size * 0.8,
              fontWeight: '600',
              color: theme.colors.onSurface,
              marginBottom: theme.spacing.md,
            }}
          >
            Notifications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            {Object.entries(notifications).map(([key, value]) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ color: theme.colors.onSurface, fontSize: theme.typography.body.size }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleSettingToggle(key)}
                  style={{ cursor: 'pointer' }}
                />
              </label>
            ))}
          </div>
        </Card>

        {/* Privacy */}
        <Card padding="md" radius="md" shadow="elevation1" tone="surface" style={{ marginBottom: theme.spacing.lg }}>
          <h3
            style={{
              fontSize: theme.typography.h2.size * 0.8,
              fontWeight: '600',
              color: theme.colors.onSurface,
              marginBottom: theme.spacing.md,
            }}
          >
            Privacy
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            {Object.entries(privacy).map(([key, value]) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <span style={{ color: theme.colors.onSurface, fontSize: theme.typography.body.size }}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handlePrivacyToggle(key)}
                  style={{ cursor: 'pointer' }}
                />
              </label>
            ))}
          </div>
        </Card>

        {/* Logout */}
        <Card padding="md" radius="md" shadow="elevation1" tone="surface">
          <Button
            title="Logout"
            variant="danger"
            onPress={handleLogout}
          />
        </Card>
      </div>
    </ScreenShell>
  );
}
