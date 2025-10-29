/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useSafetyCenter } from '../useSafetyCenter';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Heavy: 'heavy',
    Light: 'light',
  },
}));

// Mock logger
jest.mock('@pawfectmatch/core', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useSafetyCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with emergency mode disabled', () => {
    const { result } = renderHook(() => useSafetyCenter());

    expect(result.current.emergencyMode).toBe(false);
    expect(result.current.isReporting).toBe(false);
  });

  it('should provide safety options', () => {
    const { result } = renderHook(() => useSafetyCenter());

    expect(result.current.safetyOptions).toHaveLength(5);

    const optionIds = result.current.safetyOptions.map((o) => o.id);
    expect(optionIds).toContain('report');
    expect(optionIds).toContain('block');
    expect(optionIds).toContain('privacy');
    expect(optionIds).toContain('emergency');
    expect(optionIds).toContain('safety-tips');
  });

  it('should show confirmation dialog when toggling emergency mode', async () => {
    const { result } = renderHook(() => useSafetyCenter());

    act(() => {
      void result.current.toggleEmergencyMode();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Enable Emergency Mode',
      'Emergency mode will limit interactions and enhance safety features.',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Enable' }),
      ]),
    );
  });

  it('should enable emergency mode when confirmed', () => {
    // Mock Alert to auto-confirm
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const enableButton = buttons?.find((b: any) => b.text === 'Enable');
      if (enableButton?.onPress) {
        enableButton.onPress();
      }
    });

    const { result } = renderHook(() => useSafetyCenter());

    act(() => {
      void result.current.toggleEmergencyMode();
    });

    expect(result.current.emergencyMode).toBe(true);
  });

  it('should disable emergency mode when toggling off', () => {
    // Mock Alert to auto-confirm
    (Alert.alert as jest.Mock).mockImplementation((title, message, buttons) => {
      const confirmButton = buttons?.find((b: any) => b.text === 'Enable' || b.text === 'Disable');
      if (confirmButton?.onPress) {
        confirmButton.onPress();
      }
    });

    const { result } = renderHook(() => useSafetyCenter());

    // Enable first
    act(() => {
      void result.current.toggleEmergencyMode();
    });

    expect(result.current.emergencyMode).toBe(true);

    // Disable
    act(() => {
      void result.current.toggleEmergencyMode();
    });

    expect(result.current.emergencyMode).toBe(false);
  });

  it('should set emergency mode directly', () => {
    const { result } = renderHook(() => useSafetyCenter());

    act(() => {
      result.current.setEmergencyMode(true);
    });

    expect(result.current.emergencyMode).toBe(true);

    act(() => {
      result.current.setEmergencyMode(false);
    });

    expect(result.current.emergencyMode).toBe(false);
  });

  it('should report user successfully', async () => {
    const { result } = renderHook(() => useSafetyCenter());

    let reportResult: boolean | undefined;

    await act(async () => {
      reportResult = await result.current.reportUser('user123', 'Inappropriate behavior');
    });

    // Fast-forward API simulation
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.isReporting).toBe(false);
    });

    expect(reportResult).toBe(true);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Report Submitted',
      'Thank you for your report. We will review it shortly.',
    );
  });

  it('should set reporting state during report submission', async () => {
    const { result } = renderHook(() => useSafetyCenter());

    const reportPromise = act(async () => {
      return result.current.reportUser('user123', 'Spam');
    });

    // Should be reporting
    expect(result.current.isReporting).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await reportPromise;

    await waitFor(() => {
      expect(result.current.isReporting).toBe(false);
    });
  });

  it('should handle safety option selection', () => {
    const { result } = renderHook(() => useSafetyCenter());

    const reportOption = result.current.safetyOptions.find((o) => o.id === 'report');

    act(() => {
      result.current.handleSafetyOption(reportOption!);
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Report User',
      'This feature is coming soon. Please contact support for urgent issues.',
    );
  });

  it('should contact support', () => {
    const { result } = renderHook(() => useSafetyCenter());

    act(() => {
      result.current.contactSupport();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Contact Support',
      'Support contact options coming soon!',
    );
  });

  it('should view safety guidelines', () => {
    const { result } = renderHook(() => useSafetyCenter());

    act(() => {
      result.current.viewSafetyGuidelines();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Safety Guidelines',
      'Safety guidelines will be available soon!',
    );
  });

  it('should navigate to privacy settings', () => {
    const { result } = renderHook(() => useSafetyCenter());

    act(() => {
      result.current.navigateToPrivacySettings();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Privacy Settings',
      'Navigate to Privacy Settings screen (coming soon)',
    );
  });

  it('should setup emergency contacts', () => {
    const { result } = renderHook(() => useSafetyCenter());

    act(() => {
      result.current.setupEmergencyContacts();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Emergency Contacts',
      'Emergency contact setup coming soon',
    );
  });

  it('should view safety tips', () => {
    const { result } = renderHook(() => useSafetyCenter());

    act(() => {
      result.current.viewSafetyTips();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Safety Tips',
      'Safety tips and guidelines will be available soon',
    );
  });

  it('should provide all safety option details', () => {
    const { result } = renderHook(() => useSafetyCenter());

    result.current.safetyOptions.forEach((option) => {
      expect(option).toHaveProperty('id');
      expect(option).toHaveProperty('title');
      expect(option).toHaveProperty('description');
      expect(option).toHaveProperty('icon');
      expect(option).toHaveProperty('color');
      expect(option).toHaveProperty('action');
      expect(typeof option.action).toBe('function');
    });
  });

  it('should have correct color codes for safety options', () => {
    const { result } = renderHook(() => useSafetyCenter());

    const reportOption = result.current.safetyOptions.find((o) => o.id === 'report');
    expect(reportOption?.color).toBe('#EF4444'); // Red

    const privacyOption = result.current.safetyOptions.find((o) => o.id === 'privacy');
    expect(privacyOption?.color).toBe('#10B981'); // Green
  });

  it('should trigger haptic feedback on emergency mode toggle', async () => {
    const Haptics = require('expo-haptics');
    const { result } = renderHook(() => useSafetyCenter());

    await act(async () => {
      await result.current.toggleEmergencyMode();
    });

    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
  });

  it('should trigger haptic feedback on safety option selection', () => {
    const Haptics = require('expo-haptics');
    const { result } = renderHook(() => useSafetyCenter());

    const option = result.current.safetyOptions[0];

    act(() => {
      result.current.handleSafetyOption(option);
    });

    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });

  it('should return stable function references', () => {
    const { result, rerender } = renderHook(() => useSafetyCenter());

    const firstToggleEmergencyMode = result.current.toggleEmergencyMode;
    const firstReportUser = result.current.reportUser;
    const firstContactSupport = result.current.contactSupport;
    const firstHandleSafetyOption = result.current.handleSafetyOption;

    rerender();

    expect(result.current.toggleEmergencyMode).toBe(firstToggleEmergencyMode);
    expect(result.current.reportUser).toBe(firstReportUser);
    expect(result.current.contactSupport).toBe(firstContactSupport);
    expect(result.current.handleSafetyOption).toBe(firstHandleSafetyOption);
  });

  it('should provide privacy settings option action', () => {
    const { result } = renderHook(() => useSafetyCenter());

    const privacyOption = result.current.safetyOptions.find((o) => o.id === 'privacy');

    expect(privacyOption).toBeDefined();
    expect(privacyOption?.title).toBe('Privacy Settings');

    act(() => {
      privacyOption?.action();
    });

    expect(Alert.alert).toHaveBeenCalled();
  });

  it('should provide emergency contacts option action', () => {
    const { result } = renderHook(() => useSafetyCenter());

    const emergencyOption = result.current.safetyOptions.find((o) => o.id === 'emergency');

    expect(emergencyOption).toBeDefined();
    expect(emergencyOption?.title).toBe('Emergency Contacts');

    act(() => {
      emergencyOption?.action();
    });

    expect(Alert.alert).toHaveBeenCalled();
  });
});
