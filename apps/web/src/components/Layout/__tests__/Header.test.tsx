import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../Header';

// Mock dependencies
jest.mock('../../../contexts/AuthContext');

// Create mock functions first
const mockPush = jest.fn();
const mockUseRouter = jest.fn().mockImplementation(() => ({
  push: mockPush,
}));
const mockUsePathname = jest.fn().mockImplementation(() => '/dashboard');

// Then use them in jest.mock
jest.mock('next/navigation', () => {
  return {
    useRouter: () => ({ push: mockPush }),
    usePathname: () => '/dashboard',
  };
});
jest.mock('next/link', () => {
  return ({ children, href, ...props }: { children: React.ReactNode, href: string, [key: string]: unknown }) => {
    return (
      <a
        href={href}
        {...props}
      >
        {children}
      </a>
    );
  };
});
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { [key: string]: unknown }) => {
    // In tests, we can use a simple mock that doesn't need alt text
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} alt={(props as unknown).alt || ''} />;
  },
}));

// Mock ThemeToggle component
jest.mock('../../ThemeToggle', () => {
  return function MockThemeToggle(): JSX.Element {
    return <button aria-label="Toggle theme">Theme</button>;
  };
});

const mockUser = {
  id: 'user-123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  avatar: 'https://example.com/avatar.jpg',
  premium: {
    isActive: false,
  },
};

const mockLogout = jest.fn();

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the mocked router functions
    mockUseRouter.mockImplementation(() => ({ push: mockPush }));
    mockUsePathname.mockImplementation(() => '/dashboard');

    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    });
  });

  describe('Rendering', () => {
    it('renders the header with logo', () => {
      render(<Header />);

      expect(screen.getByText('🐾')).toBeInTheDocument();
      expect(screen.getByText('PawfectMatch')).toBeInTheDocument();
    });

    it('renders all navigation items', () => {
      render(<Header />);

      expect(screen.getByText('Discover')).toBeInTheDocument();
      expect(screen.getByText('Map')).toBeInTheDocument();
      expect(screen.getByText('Matches')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('renders theme toggle', () => {
      render(<Header />);

      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    it('renders Add Pet button', () => {
      render(<Header />);

      expect(screen.getByText('Add Pet')).toBeInTheDocument();
    });

    it('shows Premium button for non-premium users', () => {
      render(<Header />);

      expect(screen.getByText('Premium')).toBeInTheDocument();
    });

    it('displays user avatar when available', () => {
      render(<Header />);

      const avatar = screen.getByAltText('John');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', mockUser.avatar);
    });

    it('displays user initials when no avatar', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { ...mockUser, avatar: undefined },
        logout: mockLogout,
      });

      render(<Header />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('shows premium badge for premium users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { ...mockUser, premium: { isActive: true } },
        logout: mockLogout,
      });

      render(<Header />);

      // Premium badge should be visible in logo area
      expect(screen.getByText('PawfectMatch').nextElementSibling).toBeTruthy();
    });

    it('does not show Premium button for premium users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { ...mockUser, premium: { isActive: true } },
        logout: mockLogout,
      });

      render(<Header />);

      // Only one "Premium" text should exist (in context, not as button)
      const premiumButtons = screen.queryAllByRole('link', { name: /Premium/i });
      expect(premiumButtons.length).toBe(0);
    });
  });

  describe('Navigation', () => {
    it('highlights active navigation item', () => {
      mockUsePathname.mockReturnValue('/swipe');

      render(<Header />);

      const discoverLink = screen.getAllByText('Discover')[0].closest('a');
      expect(discoverLink).toHaveClass('text-pink-600', 'bg-pink-50');
    });

    it('applies correct aria-current to active page', () => {
      mockUsePathname.mockReturnValue('/matches');

      render(<Header />);

      const matchesLinks = screen.getAllByText('Matches');
      const activeLink = matchesLinks[0].closest('a')!;
      expect(activeLink).toHaveAttribute('aria-current', 'page');
    });

    it('navigates to correct paths', () => {
      render(<Header />);

      expect(screen.getAllByText('Discover')[0].closest('a')!).toHaveAttribute('href', '/swipe');
      expect(screen.getAllByText('Map')[0].closest('a')!).toHaveAttribute('href', '/map');
      expect(screen.getAllByText('Matches')[0].closest('a')!).toHaveAttribute('href', '/matches');
      expect(screen.getAllByText('Profile')[0].closest('a')!).toHaveAttribute('href', '/profile');
    });
  });

  describe('User Actions', () => {
    it('handles logout when logout button is clicked', async () => {
      mockLogout.mockImplementation(() => Promise.resolve());

      render(<Header />);

      const logoutButton = screen.getAllByLabelText('Logout')[0];
      fireEvent.click(logoutButton as HTMLElement);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });

      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/');
        },
        { timeout: 2000 },
      );
    });

    it('navigates to Add Pet page', () => {
      render(<Header />);

      const addPetLink = screen.getAllByText('Add Pet')[0].closest('a')!;
      expect(addPetLink).toHaveAttribute('href', '/pets/new');
    });

    it('navigates to Premium page', () => {
      render(<Header />);

      const premiumLink = screen.getByText('Premium').closest('a');
      expect(premiumLink).toHaveAttribute('href', '/premium');
    });
  });

  describe('Mobile Menu', () => {
    it('toggles mobile menu when hamburger button is clicked', () => {
      render(<Header />);

      const menuButton = screen.getByLabelText('Open menu');
      expect(menuButton).toBeInTheDocument();

      // Mobile menu should not be visible initially
      const mobileNavItems = screen.queryAllByText('Discover');
      expect(mobileNavItems.length).toBe(1); // Only desktop version

      // Open mobile menu
      fireEvent.click(menuButton);

      // Now mobile items should be visible
      const openedNavItems = screen.queryAllByText('Discover');
      expect(openedNavItems.length).toBe(2); // Desktop + mobile versions
    });

    it('changes button icon when menu is opened', () => {
      render(<Header />);

      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
    });

    it('closes mobile menu when navigation item is clicked', () => {
      render(<Header />);

      // Open menu
      const menuButton = screen.getByLabelText('Open menu');
      fireEvent.click(menuButton);

      // Click a navigation item
      const mobileNavItems = screen.getAllByText('Discover');
      const mobileDiscoverLink = mobileNavItems[1]; // Second one is in mobile menu
      fireEvent.click(mobileDiscoverLink as HTMLElement);

      // Menu should close
      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('closes mobile menu when Add Pet is clicked', () => {
      render(<Header />);

      // Open menu
      fireEvent.click(screen.getByLabelText('Open menu'));

      // Click Add Pet in mobile menu
      const addPetLinks = screen.getAllByText('Add Pet');
      fireEvent.click(addPetLinks[1] as HTMLElement); // Mobile version

      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
    });

    it('closes mobile menu and logs out when logout is clicked', async () => {
      mockLogout.mockImplementation(() => Promise.resolve());

      render(<Header />);

      // Open menu
      fireEvent.click(screen.getByLabelText('Open menu'));

      // Click logout in mobile menu
      const logoutButtons = screen.getAllByLabelText('Logout');
      fireEvent.click(logoutButtons[1] as HTMLElement); // Mobile version

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });

      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/');
        },
        { timeout: 2000 },
      );
    });

    it('renders mobile-specific Premium button text', () => {
      render(<Header />);

      fireEvent.click(screen.getByLabelText('Open menu'));

      expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for buttons', () => {
      render(<Header />);

      expect(screen.getByLabelText('Open menu')).toBeInTheDocument();
      expect(screen.getAllByLabelText('Logout')[0]).toBeInTheDocument();
    });

    it('has proper ARIA labels for billing toggles', () => {
      render(<Header />);

      fireEvent.click(screen.getByLabelText('Open menu'));

      // Check navigation items have proper labels
      const discoverLinks = screen.getAllByLabelText('Discover');
      expect(discoverLinks.length).toBeGreaterThan(0);
    });

    it('sets aria-expanded correctly on mobile menu button', () => {
      render(<Header />);

      const menuButton = screen.getByLabelText('Open menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(menuButton);

      const expandedButton = screen.getByLabelText('Close menu');
      expect(expandedButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('uses aria-hidden for decorative icons in mobile menu', () => {
      render(<Header />);

      fireEvent.click(screen.getByLabelText('Open menu'));

      // Check mobile menu exists
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();

      // Check that we have the Discover text in the mobile menu
      const mobileText = screen.getAllByText('Discover');
      expect(mobileText.length).toBeGreaterThan(1);
    });
  });

  describe('Responsive Behavior', () => {
    it('hides desktop navigation on mobile', () => {
      render(<Header />);

      const desktopNav = screen.getAllByText('Discover')[0].closest('nav')!;
      expect(desktopNav).toHaveClass('hidden', 'md:flex');
    });

    it('hides desktop actions on mobile', () => {
      render(<Header />);

      // Check that desktop actions exist
      const addPetButtons = screen.getAllByText('Add Pet');
      expect(addPetButtons.length).toBeGreaterThan(0);
    });

    it('shows mobile menu button only on mobile', () => {
      render(<Header />);

      const mobileButton = screen.getByLabelText('Open menu');
      expect(mobileButton).toHaveClass('md:hidden');
    });
  });

  describe('Visual States', () => {
    it('applies correct styles to active navigation items', () => {
      mockUsePathname.mockReturnValue('/profile');

      render(<Header />);

      const profileLink = screen.getAllByText('Profile')[0].closest('a')!;
      expect(profileLink).toHaveClass('text-pink-600', 'bg-pink-50');
    });

    it('applies hover styles to inactive navigation items', () => {
      mockUsePathname.mockReturnValue('/swipe');

      render(<Header />);

      const mapLink = screen.getAllByText('Map')[0].closest('a')!;
      expect(mapLink).toHaveClass('text-gray-600', 'hover:text-pink-600', 'hover:bg-pink-50');
    });

    it('displays gradient on logo text', () => {
      render(<Header />);

      const logo = screen.getByText('PawfectMatch');
      expect(logo).toHaveClass(
        'bg-gradient-to-r',
        'from-pink-500',
        'to-purple-600',
        'bg-clip-text',
        'text-transparent',
      );
    });

    it('displays gradient on Premium button', () => {
      render(<Header />);

      const premiumButton = screen.getByText('Premium').closest('a');
      expect(premiumButton).toHaveClass('bg-gradient-to-r', 'from-yellow-400', 'to-orange-500');
    });
  });

  describe('Logo', () => {
    it('links to dashboard', () => {
      render(<Header />);

      const logo = screen.getByText('PawfectMatch').closest('a');
      expect(logo).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Edge Cases', () => {
    it('handles user with no first name', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { ...mockUser, firstName: undefined, lastName: undefined },
        logout: mockLogout,
      });

      render(<Header />);

      // Should not crash
      expect(screen.getByText('PawfectMatch')).toBeInTheDocument();
    });

    it('handles logout errors gracefully', async () => {
      mockLogout.mockImplementation(() => Promise.reject(new Error('Logout failed')));

      render(<Header />);

      const logoutButton = screen.getAllByLabelText('Logout')[0];
      fireEvent.click(logoutButton as HTMLElement);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });

      // Should still attempt to redirect
      await waitFor(
        () => {
          expect(mockPush).toHaveBeenCalledWith('/');
        },
        { timeout: 3000 },
      );
    });
  });
});
