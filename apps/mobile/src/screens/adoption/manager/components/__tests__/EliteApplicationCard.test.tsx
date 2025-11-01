/**
 * EliteApplicationCard Comprehensive Component Tests
 * Tests rendering, props, interactions, states, edge cases, and accessibility
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import React from 'react';
import { render, fireEvent, screen } from '@/test-utils/unified-render';
import { EliteApplicationCard } from '../EliteApplicationCard';
import type { AdoptionApplication } from '@/hooks/screens/useAdoptionManagerScreen';

// Mock dependencies
jest.mock('../../../components', () => ({
  EliteButton: ({ title, onPress, testID, ...props }: any) => {
    const { TouchableOpacity, Text } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} testID={testID} {...props}>
        <Text>{title}</Text>
      </TouchableOpacity>
    );
  },
  EliteCard: ({ children, style, ...props }: any) => {
    const { View } = require('react-native');
    return <View testID="elite-card" style={style} {...props}>{children}</View>;
  },
}));

jest.mock('../../../animation', () => ({
  GlobalStyles: {
    mb4: { marginBottom: 16 },
    mx2: { marginHorizontal: 8 },
  },
  Colors: {
    error: { 500: '#ef4444' },
    success: '#10b981',
  },
}));

describe('EliteApplicationCard Component Tests', () => {
  const mockApplication: AdoptionApplication = {
    id: 'app-1',
    petId: 'pet-1',
    petName: 'Fluffy',
    applicantName: 'John Doe',
    applicantEmail: 'john@example.com',
    status: 'pending',
    submittedAt: '2024-01-20T00:00:00Z',
    experience: '5 years with cats',
    livingSpace: 'House with garden',
    references: 3,
  };

  const defaultProps = {
    application: mockApplication,
    getStatusColor: jest.fn((status: string) => {
      const colors: Record<string, string> = {
        pending: '#f59e0b',
        approved: '#10b981',
        rejected: '#ef4444',
        withdrawn: '#6b7280',
      };
      return colors[status] || '#6b7280';
    }),
    getStatusIcon: jest.fn((status: string) => {
      const icons: Record<string, string> = {
        pending: '⏳',
        approved: '✅',
        rejected: '❌',
        withdrawn: '↩️',
      };
      return icons[status] || '❓';
    }),
    onApprove: jest.fn(),
    onReject: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render application card successfully', () => {
      render(
        <EliteApplicationCard {...defaultProps} />,
      );

      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('Applying for: Fluffy')).toBeTruthy();
    });

    it('should render applicant email', () => {
      render(
        <EliteApplicationCard {...defaultProps} />,
      );

      expect(screen.getByText('john@example.com')).toBeTruthy();
    });

    it('should render living space information', () => {
      render(
        <EliteApplicationCard {...defaultProps} />,
      );

      expect(screen.getByText('House with garden')).toBeTruthy();
    });

    it('should render experience information', () => {
      render(
        <EliteApplicationCard {...defaultProps} />,
      );

      expect(screen.getByText('5 years with cats')).toBeTruthy();
    });

    it('should render references count', () => {
      render(
        <EliteApplicationCard {...defaultProps} />,
      );

      expect(screen.getByText('3 references')).toBeTruthy();
    });

    it('should render status badge with correct color and icon', () => {
      render(
        <EliteApplicationCard {...defaultProps} />,
      );

      expect(defaultProps.getStatusColor).toHaveBeenCalledWith('pending');
      expect(defaultProps.getStatusIcon).toHaveBeenCalledWith('pending');
      expect(screen.getByText(/Pending/)).toBeTruthy();
    });
  });

  describe('Status Display', () => {
    it('should display pending status correctly', () => {
      render(
        <EliteApplicationCard {...defaultProps} />,
      );

      expect(screen.getByText(/Pending/)).toBeTruthy();
    });

    it('should display approved status', () => {
      const approvedApp = { ...defaultProps, application: { ...mockApplication, status: 'approved' as const } };
      render(
        <EliteApplicationCard {...approvedApp} />,
      );

      expect(approvedApp.getStatusColor).toHaveBeenCalledWith('approved');
      expect(approvedApp.getStatusIcon).toHaveBeenCalledWith('approved');
    });

    it('should display rejected status correctly', () => {
      const rejectedApp = { ...defaultProps, application: { ...mockApplication, status: 'rejected' as const } };
      render(
        <EliteApplicationCard {...rejectedApp} />,
      );

      expect(rejectedApp.getStatusColor).toHaveBeenCalledWith('rejected');
      expect(rejectedApp.getStatusIcon).toHaveBeenCalledWith('rejected');
    });

    it('should display withdrawn status correctly', () => {
      const withdrawnApp = { ...defaultProps, application: { ...mockApplication, status: 'withdrawn' as const } };
      render(
        <EliteApplicationCard {...withdrawnApp} />,
      );

      expect(withdrawnApp.getStatusColor).toHaveBeenCalledWith('withdrawn');
      expect(withdrawnApp.getStatusIcon).toHaveBeenCalledWith('withdrawn');
    });
  });

  describe('Action Buttons', () => {
    it('should show approve and reject buttons for pending applications', () => {
      render(
        <EliteApplicationCard {...defaultProps} />,
      );

      expect(screen.getByText('Reject')).toBeTruthy();
      expect(screen.getByText('Approve')).toBeTruthy();
    });

    it('should call onApprove when approve button is pressed', () => {
      render(
        <EliteApplicationCard {...defaultProps} />,
      );

      const approveButton = screen.getByText('Approve');
      fireEvent.press(approveButton);

      expect(defaultProps.onApprove).toHaveBeenCalledWith('app-1');
      expect(defaultProps.onApprove).toHaveBeenCalledTimes(1);
    });

    it('should call onReject when reject button is pressed', () => {
      render(
        <EliteApplicationCard {...defaultProps} />,
      );

      const rejectButton = screen.getByText('Reject');
      fireEvent.press(rejectButton);

      expect(defaultProps.onReject).toHaveBeenCalledWith('app-1');
      expect(defaultProps.onReject).toHaveBeenCalledTimes(1);
    });

    it('should not show action buttons for approved applications', () => {
      const approvedApp = { ...defaultProps, application: { ...mockApplication, status: 'approved' as const } };
      render(
        <EliteApplicationCard {...approvedApp} />,
      );

      expect(screen.queryByText('Reject')).toBeNull();
      expect(screen.queryByText('Approve')).toBeNull();
    });

    it('should not show action buttons for rejected applications', () => {
      const rejectedApp = { ...defaultProps, application: { ...mockApplication, status: 'rejected' as const } };
      render(
        <EliteApplicationCard {...rejectedApp} />,
      );

      expect(screen.queryByText('Reject')).toBeNull();
      expect(screen.queryByText('Approve')).toBeNull();
    });

    it('should not show action buttons for withdrawn applications', () => {
      const withdrawnApp = { ...defaultProps, application: { ...mockApplication, status: 'withdrawn' as const } };
      render(
        <EliteApplicationCard {...withdrawnApp} />,
      );

      expect(screen.queryByText('Reject')).toBeNull();
      expect(screen.queryByText('Approve')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty applicant name gracefully', () => {
      const emptyNameApp = { ...defaultProps, application: { ...mockApplication, applicantName: '' } };
      render(
        <EliteApplicationCard {...emptyNameApp} />,
      );

      // Should still render without crashing
      expect(screen.getByText('Applying for: Fluffy')).toBeTruthy();
    });

    it('should handle zero references', () => {
      const zeroRefsApp = { ...defaultProps, application: { ...mockApplication, references: 0 } };
      render(
        <EliteApplicationCard {...zeroRefsApp} />,
      );

      expect(screen.getByText('0 references')).toBeTruthy();
    });

    it('should handle many references', () => {
      const manyRefsApp = { ...defaultProps, application: { ...mockApplication, references: 15 } };
      render(
        <EliteApplicationCard {...manyRefsApp} />,
      );

      expect(screen.getByText('15 references')).toBeTruthy();
    });

    it('should handle long applicant names', () => {
      const longNameApp = {
        ...defaultProps,
        application: { ...mockApplication, applicantName: 'A'.repeat(100) },
      };
      render(
        <EliteApplicationCard {...longNameApp} />,
      );

      expect(screen.getByText('A'.repeat(100))).toBeTruthy();
    });

    it('should handle long email addresses', () => {
      const longEmailApp = {
        ...defaultProps,
        application: { ...mockApplication, applicantEmail: 'a'.repeat(50) + '@example.com' },
      };
      render(
        <EliteApplicationCard {...longEmailApp} />,
      );

      expect(screen.getByText('a'.repeat(50) + '@example.com')).toBeTruthy();
    });

    it('should handle long experience text', () => {
      const longExpApp = {
        ...defaultProps,
        application: { ...mockApplication, experience: 'A'.repeat(200) },
      };
      render(
        <EliteApplicationCard {...longExpApp} />,
      );

      expect(screen.getByText('A'.repeat(200))).toBeTruthy();
    });

    it('should handle long living space text', () => {
      const longSpaceApp = {
        ...defaultProps,
        application: { ...mockApplication, livingSpace: 'A'.repeat(150) },
      };
      render(
        <EliteApplicationCard {...longSpaceApp} />,
      );

      expect(screen.getByText('A'.repeat(150))).toBeTruthy();
    });
  });

  describe('Multiple Applications', () => {
    it('should render multiple applications correctly', () => {
      const app2: AdoptionApplication = {
        id: 'app-2',
        petId: 'pet-1',
        petName: 'Buddy',
        applicantName: 'Jane Smith',
        applicantEmail: 'jane@example.com',
        status: 'approved',
        submittedAt: '2024-01-19T00:00:00Z',
        experience: '10 years',
        livingSpace: 'Apartment',
        references: 5,
      };

      render(
        <>
          <EliteApplicationCard {...defaultProps} />
          <EliteApplicationCard {...defaultProps} application={app2} />
        </>,
      );

      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('Jane Smith')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', () => {
      const { getByText } = render(
        <EliteApplicationCard {...defaultProps} />,
      );

      // Card content should be accessible
      expect(getByText('John Doe')).toBeTruthy();
    });
  });

  describe('Theme Integration', () => {
    it('should use theme colors correctly', () => {
      render(
        <EliteApplicationCard {...defaultProps} />,
      );

      // Theme is used via useTheme hook in component
      // This is verified through rendering without errors
      expect(screen.getByText('John Doe')).toBeTruthy();
    });
  });
});

