/**
 * Delete Account Dialog Tests
 * Comprehensive test coverage for GDPR-compliant account deletion
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteAccountDialog } from '../DeleteAccountDialog';
import { AccountService } from '@pawfectmatch/core/services/AccountService';

// Mock AccountService
jest.mock('@pawfectmatch/core/services/AccountService');

describe('DeleteAccountDialog', () => {
  const mockOnSuccess = jest.fn();
  const mockOnOpenChange = jest.fn();
  const mockUserEmail = 'test@example.com';
  const mockUserId = 'user123';

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'mock-token');
  });

  describe('Warning Step', () => {
    it('should render warning step with all consequences listed', () => {
      render(
        <DeleteAccountDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      expect(screen.getByText('Delete Your Account')).toBeInTheDocument();
      expect(screen.getByText(/30-Day Grace Period/i)).toBeInTheDocument();
      expect(screen.getByText(/Your profile and all personal information/i)).toBeInTheDocument();
      expect(screen.getByText(/All your pet profiles and photos/i)).toBeInTheDocument();
    });

    it('should allow user to cancel at warning step', () => {
      render(
        <DeleteAccountDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should proceed to export step when continue clicked', () => {
      render(
        <DeleteAccountDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      const continueButton = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueButton);

      expect(screen.getByText('Download Your Data')).toBeInTheDocument();
    });
  });

  describe('Data Export Step', () => {
    it('should offer data export option', () => {
      render(
        <DeleteAccountDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      // Navigate to export step
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      expect(screen.getByText(/Download Your Data/i)).toBeInTheDocument();
      expect(screen.getByText(/We recommend downloading your data/i)).toBeInTheDocument();
    });

    it('should request data export when download button clicked', async () => {
      const mockRequestDataExport = jest.fn().mockResolvedValue({
        exportId: 'export123',
        status: 'pending',
        estimatedCompletionTime: '2025-01-01T00:00:00Z',
      });

      (AccountService as jest.Mock).mockImplementation(() => ({
        requestDataExport: mockRequestDataExport,
      }));

      render(
        <DeleteAccountDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      
      const downloadButton = screen.getByRole('button', { name: /download my data/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(mockRequestDataExport).toHaveBeenCalledWith(
          {
            userId: mockUserId,
            includeMessages: true,
            includePhotos: true,
            includeMatches: true,
            includeAnalytics: true,
            format: 'json',
          },
          'mock-token',
        );
      });

      expect(screen.getByText(/Data export requested!/i)).toBeInTheDocument();
    });

    it('should allow skip and continue to final step', () => {
      render(
        <DeleteAccountDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      fireEvent.click(screen.getByRole('button', { name: /skip & continue/i }));

      expect(screen.getByText('Final Confirmation')).toBeInTheDocument();
    });
  });

  describe('Final Confirmation Step', () => {
    beforeEach(() => {
      render(
        <DeleteAccountDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      // Navigate to final step
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      fireEvent.click(screen.getByRole('button', { name: /skip & continue/i }));
    });

    it('should require email confirmation', () => {
      const deleteButton = screen.getByRole('button', { name: /delete my account/i });
      expect(deleteButton).toBeDisabled();
    });

    it('should show error if email does not match', async () => {
      const emailInput = screen.getByLabelText(/confirm your email/i);
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });

      await waitFor(() => {
        expect(screen.getByText(/email does not match/i)).toBeInTheDocument();
      });
    });

    it('should enable delete button when email matches', () => {
      const emailInput = screen.getByLabelText(/confirm your email/i);
      fireEvent.change(emailInput, { target: { value: mockUserEmail } });

      const deleteButton = screen.getByRole('button', { name: /delete my account/i });
      expect(deleteButton).not.toBeDisabled();
    });

    it('should successfully delete account with valid inputs', async () => {
      const mockDeleteAccount = jest.fn().mockResolvedValue({
        success: true,
        deletionScheduledDate: '2025-02-01T00:00:00Z',
        gracePeriodEndsAt: '2025-02-01T00:00:00Z',
        confirmationId: 'conf123',
        message: 'Account deletion scheduled',
      });

      (AccountService as jest.Mock).mockImplementation(() => ({
        requestAccountDeletion: mockDeleteAccount,
      }));

      const emailInput = screen.getByLabelText(/confirm your email/i);
      fireEvent.change(emailInput, { target: { value: mockUserEmail } });

      const deleteButton = screen.getByRole('button', { name: /delete my account/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockDeleteAccount).toHaveBeenCalledWith(
          {
            userId: mockUserId,
            reason: 'other',
            confirmEmail: mockUserEmail,
          },
          'mock-token',
        );
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('should collect optional feedback', async () => {
      const mockDeleteAccount = jest.fn().mockResolvedValue({
        success: true,
        deletionScheduledDate: '2025-02-01T00:00:00Z',
        gracePeriodEndsAt: '2025-02-01T00:00:00Z',
        confirmationId: 'conf123',
        message: 'Account deletion scheduled',
      });

      (AccountService as jest.Mock).mockImplementation(() => ({
        requestAccountDeletion: mockDeleteAccount,
      }));

      const emailInput = screen.getByLabelText(/confirm your email/i);
      fireEvent.change(emailInput, { target: { value: mockUserEmail } });

      const feedbackInput = screen.getByLabelText(/additional feedback/i);
      fireEvent.change(feedbackInput, { target: { value: 'Found a match!' } });

      const deleteButton = screen.getByRole('button', { name: /delete my account/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockDeleteAccount).toHaveBeenCalledWith(
          expect.objectContaining({
            feedback: 'Found a match!',
          }),
          'mock-token',
        );
      });
    });

    it('should handle deletion errors gracefully', async () => {
      const mockDeleteAccount = jest.fn().mockRejectedValue(new Error('Network error'));

      (AccountService as jest.Mock).mockImplementation(() => ({
        requestAccountDeletion: mockDeleteAccount,
      }));

      const emailInput = screen.getByLabelText(/confirm your email/i);
      fireEvent.change(emailInput, { target: { value: mockUserEmail } });

      const deleteButton = screen.getByRole('button', { name: /delete my account/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should allow back navigation through steps', () => {
      render(
        <DeleteAccountDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      // Go to export step
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(screen.getByText('Download Your Data')).toBeInTheDocument();

      // Go back
      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(screen.getByText('Delete Your Account')).toBeInTheDocument();
    });
  });

  describe('Dialog State Management', () => {
    it('should reset state when dialog closes', () => {
      const { rerender } = render(
        <DeleteAccountDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      // Navigate to final step
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      fireEvent.click(screen.getByRole('button', { name: /skip & continue/i }));

      // Close dialog
      rerender(
        <DeleteAccountDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      // Reopen and verify it's back to warning step
      rerender(
        <DeleteAccountDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      expect(screen.getByText('Delete Your Account')).toBeInTheDocument();
    });
  });

  describe('GDPR Compliance', () => {
    it('should mention 30-day grace period', () => {
      render(
        <DeleteAccountDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      expect(screen.getByText(/30-Day Grace Period/i)).toBeInTheDocument();
    });

    it('should provide data export option (GDPR Article 20)', () => {
      render(
        <DeleteAccountDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(screen.getByRole('button', { name: /download my data/i })).toBeInTheDocument();
    });

    it('should list all data that will be deleted', () => {
      render(
        <DeleteAccountDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          userEmail={mockUserEmail}
          userId={mockUserId}
          onSuccess={mockOnSuccess}
        />,
      );

      expect(screen.getByText(/profile and all personal information/i)).toBeInTheDocument();
      expect(screen.getByText(/pet profiles and photos/i)).toBeInTheDocument();
      expect(screen.getByText(/matches and conversations/i)).toBeInTheDocument();
      expect(screen.getByText(/subscription and payment history/i)).toBeInTheDocument();
    });
  });
});
