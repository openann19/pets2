import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { User } from '../types';

// Mock the API
jest.mock('../services/api', () => ({
  api: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

const mockUser: User = {
  _id: '123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  // Add other required fields from your User type
  dateOfBirth: '1990-01-01',
  age: 30,
  location: { type: 'Point', coordinates: [0, 0] },
  preferences: { maxDistance: 50, ageRange: { min: 0, max: 20 }, species: [], intents: [], notifications: { email: true, push: true, matches: true, messages: true } },
  premium: { isActive: false, plan: 'basic', features: { unlimitedLikes: false, boostProfile: false, seeWhoLiked: false, advancedFilters: false } },
  pets: [],
  analytics: { totalSwipes: 0, totalLikes: 0, totalMatches: 0, profileViews: 0, lastActive: '' },
  isEmailVerified: true,
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

describe('useAuth Hook', () => {
  it('should handle login and logout', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Mock successful login
    (api.login as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token',
    });

    // Test login
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);

    // Test logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
