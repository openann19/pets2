/**
 * Moderation Dashboard Frontend Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModerationDashboard from '../app/(admin)/moderation/page';

// Mock fetch
global.fetch = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock logger
jest.mock('../src/services/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('ModerationDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockModerationItem = {
    _id: 'test-id-1',
    userId: {
      _id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    },
    photoUrl: 'https://test.com/photo.jpg',
    uploadedAt: new Date().toISOString(),
    status: 'pending',
    priority: 'normal',
    imageMetadata: {
      width: 1920,
      height: 1080,
      format: 'jpg',
      fileSize: 2048000,
    },
    userHistory: {
      totalUploads: 5,
      rejectedUploads: 1,
      approvedUploads: 3,
      isTrustedUser: false,
      accountAge: 15,
    },
  };

  const mockQueueResponse = {
    success: true,
    items: [mockModerationItem],
    pagination: {
      total: 1,
      limit: 50,
      skip: 0,
      hasMore: false,
    },
  };

  const mockStatsResponse = {
    success: true,
    stats: {
      queue: {
        byStatus: {
          pending: 12,
          approved: 150,
          rejected: 8,
        },
      },
    },
  };

  test('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    render(<ModerationDashboard />);

    expect(screen.getByText(/loading moderation queue/i)).toBeInTheDocument();
  });

  test('displays moderation queue after loading', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockQueueResponse,
      })
      .mockResolvedValueOnce({
        json: async () => mockStatsResponse,
      });

    render(<ModerationDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/photo moderation/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText(/item 1 of 1/i)).toBeInTheDocument();
  });

  test('displays empty queue message when no items', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, items: [], pagination: {} }),
      })
      .mockResolvedValueOnce({
        json: async () => mockStatsResponse,
      });

    render(<ModerationDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/queue empty/i)).toBeInTheDocument();
    });
  });

  test('approves photo when approve button clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockQueueResponse,
      })
      .mockResolvedValueOnce({
        json: async () => mockStatsResponse,
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true }),
      });

    render(<ModerationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const approveButton = screen.getByText(/approve/i);
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/approve'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  test('rejects photo with reason', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockQueueResponse,
      })
      .mockResolvedValueOnce({
        json: async () => mockStatsResponse,
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true }),
      });

    // Mock window.prompt
    global.prompt = jest.fn()
      .mockReturnValueOnce('explicit') // category
      .mockReturnValueOnce('Inappropriate content'); // reason

    render(<ModerationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const rejectButton = screen.getByText(/reject \(r\)/i);
    fireEvent.click(rejectButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reject'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('explicit'),
        })
      );
    });
  });

  test('quick reject buttons work', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockQueueResponse,
      })
      .mockResolvedValueOnce({
        json: async () => mockStatsResponse,
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true }),
      });

    render(<ModerationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const explicitButton = screen.getByText('Explicit Content');
    fireEvent.click(explicitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/reject'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  test('keyboard shortcuts work', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockQueueResponse,
      })
      .mockResolvedValueOnce({
        json: async () => mockStatsResponse,
      })
      .mockResolvedValueOnce({
        json: async () => ({ success: true }),
      });

    render(<ModerationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Simulate 'A' key press for approve
    fireEvent.keyDown(window, { key: 'a' });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/approve'),
        expect.any(Object)
      );
    });
  });

  test('displays user history correctly', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockQueueResponse,
      })
      .mockResolvedValueOnce({
        json: async () => mockStatsResponse,
      });

    render(<ModerationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    expect(screen.getByText(/total uploads:/i)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Total uploads
    expect(screen.getByText('3')).toBeInTheDocument(); // Approved
    expect(screen.getByText('1')).toBeInTheDocument(); // Rejected
  });

  test('displays priority badge', async () => {
    const highPriorityItem = {
      ...mockModerationItem,
      priority: 'high',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => ({ success: true, items: [highPriorityItem], pagination: {} }),
      })
      .mockResolvedValueOnce({
        json: async () => mockStatsResponse,
      });

    render(<ModerationDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/high priority/i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<ModerationDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/queue empty/i)).toBeInTheDocument();
    });
  });

  test('filters work correctly', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValue({
        json: async () => mockQueueResponse,
      })
      .mockResolvedValue({
        json: async () => mockStatsResponse,
      });

    render(<ModerationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const allButton = screen.getByText('All');
    fireEvent.click(allButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=all'),
        undefined
      );
    });
  });

  test('navigation buttons work', async () => {
    const twoItems = {
      success: true,
      items: [
        mockModerationItem,
        { ...mockModerationItem, _id: 'test-id-2', userId: { ...mockModerationItem.userId, name: 'User 2' } },
      ],
      pagination: {},
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => twoItems,
      })
      .mockResolvedValueOnce({
        json: async () => mockStatsResponse,
      });

    render(<ModerationDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText(/item 2 of 2/i)).toBeInTheDocument();
    });
  });

  test('displays photo details correctly', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockQueueResponse,
      })
      .mockResolvedValueOnce({
        json: async () => mockStatsResponse,
      });

    render(<ModerationDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/1920 × 1080/i)).toBeInTheDocument();
      expect(screen.getByText(/jpg/i)).toBeInTheDocument();
      expect(screen.getByText(/2\.00 mb/i)).toBeInTheDocument();
    });
  });

  test('moderation guidelines are displayed', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        json: async () => mockQueueResponse,
      })
      .mockResolvedValueOnce({
        json: async () => mockStatsResponse,
      });

    render(<ModerationDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/watch for/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/explicit or sexual content/i)).toBeInTheDocument();
    expect(screen.getByText(/violence or disturbing images/i)).toBeInTheDocument();
    expect(screen.getByText(/self-harm content/i)).toBeInTheDocument();
  });
});
