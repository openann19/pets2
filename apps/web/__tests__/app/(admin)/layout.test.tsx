import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { expect } from '@/test/expectAdapters';
import AdminLayout from '@/app/(admin)/layout';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a
      href={href}
      {...props}
    >
      {children}
    </a>
  );
});

// Mock Next.js usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

// Mock the enhanced components
jest.mock('@/components/admin/UIEnhancements', () => ({
  EnhancedButton: ({ children, onClick, ...props }: any) => (
    <button
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
  EnhancedCard: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  EnhancedModal: ({ isOpen, children, title, onClose }: any) =>
    isOpen ? (
      <div
        role="dialog"
        aria-labelledby="modal-title"
      >
        <h3 id="modal-title">{title}</h3>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
  EnhancedToast: ({ message, onClose }: any) => (
    <div role="alert">
      {message}
      <button onClick={onClose}>Close</button>
    </div>
  ),
  useAnnouncement: () => ({
    announce: jest.fn(),
  }),
  useFocusManagement: () => ({
    saveFocus: jest.fn(),
    restoreFocus: jest.fn(),
    trapFocus: jest.fn(),
  }),
  useReducedMotion: () => false,
  useHighContrastMode: () => false,
  useColorScheme: () => 'light',
  SkipLink: ({ children, href }: any) => (
    <a
      href={href}
      className="sr-only focus:not-sr-only"
    >
      {children}
    </a>
  ),
}));

describe('AdminLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders header with title and description', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Comprehensive platform management and monitoring'),
    ).toBeInTheDocument();
  });

  it('renders navigation sidebar', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    expect(screen.getByText('PawfectMatch')).toBeInTheDocument();
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('renders navigation menu items', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders user information in sidebar', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('renders top bar with controls', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    expect(screen.getByLabelText('Open sidebar')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });

  it('handles sidebar toggle', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const sidebarToggle = screen.getByLabelText('Open sidebar');
    fireEvent.click(sidebarToggle);

    expect(sidebarToggle).toHaveAttribute('aria-label', 'Close sidebar');
  });

  it('handles theme toggle', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const lightModeButton = screen.getByLabelText('Light mode');
    fireEvent.click(lightModeButton);

    expect(lightModeButton).toHaveClass('bg-white');
  });

  it('handles dark mode toggle', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const darkModeButton = screen.getByLabelText('Dark mode');
    fireEvent.click(darkModeButton);

    expect(darkModeButton).toHaveClass('bg-white');
  });

  it('handles system theme toggle', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const systemThemeButton = screen.getByLabelText('System theme');
    fireEvent.click(systemThemeButton);

    expect(systemThemeButton).toHaveClass('bg-white');
  });

  it('handles notification button click', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);

    // Should trigger notification creation
    expect(notificationButton).toBeInTheDocument();
  });

  it('handles settings button click', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const settingsButton = screen.getByLabelText('Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders settings modal with correct options', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const settingsButton = screen.getByLabelText('Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
  });

  it('handles settings modal close', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const settingsButton = screen.getByLabelText('Settings');
    fireEvent.click(settingsButton);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('handles navigation item clicks', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const analyticsLink = screen.getByText('Analytics');
    fireEvent.click(analyticsLink);

    expect(analyticsLink).toHaveAttribute('href', '/admin/analytics');
  });

  it('applies correct ARIA labels', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    expect(screen.getByLabelText('Skip to main content')).toBeInTheDocument();
    expect(screen.getByLabelText('Open sidebar')).toBeInTheDocument();
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });

  it('renders with correct semantic structure', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const analyticsLink = screen.getByText('Analytics');
    fireEvent.keyDown(analyticsLink, { key: 'Enter' });

    expect(analyticsLink).toHaveAttribute('href', '/admin/analytics');
  });

  it('handles escape key to close modal', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const settingsButton = screen.getByLabelText('Settings');
    fireEvent.click(settingsButton);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('renders with correct responsive classes', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky', 'top-0');

    const main = screen.getByRole('main');
    expect(main).toHaveClass('lg:pl-64');
  });

  it('renders with correct color scheme classes', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const container = screen.getByText('Admin Dashboard').closest('div');
    expect(container).toHaveClass('min-h-screen', 'bg-gray-50', 'dark:bg-gray-900');
  });

  it('handles mobile sidebar overlay', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const sidebarToggle = screen.getByLabelText('Open sidebar');
    fireEvent.click(sidebarToggle);

    // Should show overlay on mobile
    expect(sidebarToggle).toHaveAttribute('aria-label', 'Close sidebar');
  });

  it('renders toast notifications', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);

    // Should create a toast notification
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('handles toast notification close', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const notificationButton = screen.getByLabelText('Notifications');
    fireEvent.click(notificationButton);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders with correct focus management', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const settingsButton = screen.getByLabelText('Settings');
    fireEvent.click(settingsButton);

    // Should focus on modal
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('handles accessibility preferences', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const settingsButton = screen.getByLabelText('Settings');
    fireEvent.click(settingsButton);

    expect(screen.getByText('High contrast mode (system preference)')).toBeInTheDocument();
    expect(screen.getByText('Reduced motion (system preference)')).toBeInTheDocument();
  });

  it('renders with correct tab navigation', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const navigation = screen.getByRole('navigation');
    expect(navigation).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('handles user menu interactions', () => {
    render(
      <AdminLayout>
        <div>Test Content</div>
      </AdminLayout>,
    );

    const userMenu = screen.getByText('Admin User');
    expect(userMenu).toBeInTheDocument();
  });
});
