/**
 * API Integration Tests
 * Comprehensive testing of API interactions and data flow
 */

import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiService } from '../../services/apiService';
import { AuthProvider } from '../../providers/AuthProvider';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../services/logger';

// Mock API service
jest.mock('../../services/apiService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock secure storage
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock socket service
jest.mock('../../services/socketService', () => ({
  socketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    emit: jest.fn(),
    on: jest.fn(),
  },
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('API Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  describe('Authentication API', () => {
    it('should handle successful login', async () => {
      const mockResponse = {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
        token: 'mock-jwt-token',
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
        status: 200,
      });

      const TestComponent = () => {
        const { login, user, isLoading } = useAuth();

        React.useEffect(() => {
          login('test@example.com', 'password123');
        }, [login]);

        if (isLoading) return null;
        return <div testID="user-data">{user?.email}</div>;
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('user-data')).toBeTruthy();
      });

      expect(apiService.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle login failure', async () => {
      (apiService.post as jest.Mock).mockRejectedValue({
        response: {
          data: { message: 'Invalid credentials' },
          status: 401,
        },
      });

      const TestComponent = () => {
        const { login, error, isLoading } = useAuth();

        React.useEffect(() => {
          login('test@example.com', 'wrongpassword');
        }, [login]);

        if (isLoading) return null;
        return <div testID="error-message">{error}</div>;
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('error-message')).toBeTruthy();
      });
    });

    it('should handle token refresh', async () => {
      const mockRefreshResponse = {
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        data: mockRefreshResponse,
        status: 200,
      });

      const TestComponent = () => {
        const { refreshToken } = useAuth();

        React.useEffect(() => {
          refreshToken();
        }, [refreshToken]);

        return <div testID="refresh-status">Refreshed</div>;
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('refresh-status')).toBeTruthy();
      });

      expect(apiService.post).toHaveBeenCalledWith('/auth/refresh');
    });
  });

  describe('Pet Profile API', () => {
    it('should fetch pet profiles', async () => {
      const mockPets = [
        {
          id: '1',
          name: 'Buddy',
          age: 3,
          breed: 'Golden Retriever',
          photos: ['photo1.jpg', 'photo2.jpg'],
        },
        {
          id: '2',
          name: 'Luna',
          age: 2,
          breed: 'Labrador',
          photos: ['photo3.jpg'],
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        data: mockPets,
        status: 200,
      });

      const TestComponent = () => {
        const [pets, setPets] = React.useState([]);

        React.useEffect(() => {
          const fetchPets = async () => {
            try {
              const response = await apiService.get('/pets');
              setPets(response.data);
            } catch (error) {
              logger.error('Failed to fetch pets:', { error });
            }
          };
          fetchPets();
        }, []);

        return (
          <div testID="pets-list">
            {pets.map((pet: unknown) => (
              <div key={pet.id} testID={`pet-${pet.id}`}>
                {pet.name}
              </div>
            ))}
          </div>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('pet-1')).toBeTruthy();
        expect(getByTestId('pet-2')).toBeTruthy();
      });

      expect(apiService.get).toHaveBeenCalledWith('/pets');
    });

    it('should create new pet profile', async () => {
      const newPet = {
        name: 'Max',
        age: 1,
        breed: 'German Shepherd',
        bio: 'Friendly and energetic',
      };

      const mockResponse = {
        id: '3',
        ...newPet,
        photos: [],
        createdAt: new Date().toISOString(),
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
        status: 201,
      });

      const TestComponent = () => {
        const [pet, setPet] = React.useState(null);

        React.useEffect(() => {
          const createPet = async () => {
            try {
              const response = await apiService.post('/pets', newPet);
              setPet(response.data);
            } catch (error) {
              logger.error('Failed to create pet:', { error });
            }
          };
          createPet();
        }, []);

        if (!pet) return null;
        return <div testID="created-pet">{pet.name}</div>;
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('created-pet')).toBeTruthy();
      });

      expect(apiService.post).toHaveBeenCalledWith('/pets', newPet);
    });

    it('should update pet profile', async () => {
      const updatedPet = {
        id: '1',
        name: 'Buddy Updated',
        age: 4,
        breed: 'Golden Retriever',
      };

      (apiService.put as jest.Mock).mockResolvedValue({
        data: updatedPet,
        status: 200,
      });

      const TestComponent = () => {
        const [pet, setPet] = React.useState(null);

        React.useEffect(() => {
          const updatePet = async () => {
            try {
              const response = await apiService.put(`/pets/${updatedPet.id}`, updatedPet);
              setPet(response.data);
            } catch (error) {
              logger.error('Failed to update pet:', { error });
            }
          };
          updatePet();
        }, []);

        if (!pet) return null;
        return <div testID="updated-pet">{pet.name}</div>;
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('updated-pet')).toBeTruthy();
      });

      expect(apiService.put).toHaveBeenCalledWith(`/pets/${updatedPet.id}`, updatedPet);
    });
  });

  describe('Matching API', () => {
    it('should handle pet likes', async () => {
      const likeData = {
        petId: '1',
        action: 'like',
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        data: { success: true, isMatch: false },
        status: 200,
      });

      const TestComponent = () => {
        const [result, setResult] = React.useState(null);

        React.useEffect(() => {
          const likePet = async () => {
            try {
              const response = await apiService.post('/matches/like', likeData);
              setResult(response.data);
            } catch (error) {
              logger.error('Failed to like pet:', { error });
            }
          };
          likePet();
        }, []);

        if (!result) return null;
        return <div testID="like-result">{result.isMatch ? 'Match!' : 'Liked'}</div>;
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('like-result')).toBeTruthy();
      });

      expect(apiService.post).toHaveBeenCalledWith('/matches/like', likeData);
    });

    it('should handle matches', async () => {
      const matchData = {
        petId: '1',
        action: 'like',
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        data: { success: true, isMatch: true, matchId: 'match-123' },
        status: 200,
      });

      const TestComponent = () => {
        const [result, setResult] = React.useState(null);

        React.useEffect(() => {
          const likePet = async () => {
            try {
              const response = await apiService.post('/matches/like', matchData);
              setResult(response.data);
            } catch (error) {
              logger.error('Failed to like pet:', { error });
            }
          };
          likePet();
        }, []);

        if (!result) return null;
        return <div testID="match-result">{result.isMatch ? 'Match!' : 'Liked'}</div>;
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('match-result')).toBeTruthy();
      });
    });
  });

  describe('Chat API', () => {
    it('should fetch chat messages', async () => {
      const mockMessages = [
        {
          id: '1',
          text: 'Hello!',
          senderId: 'user1',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          text: 'Hi there!',
          senderId: 'user2',
          timestamp: new Date().toISOString(),
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({
        data: mockMessages,
        status: 200,
      });

      const TestComponent = () => {
        const [messages, setMessages] = React.useState([]);

        React.useEffect(() => {
          const fetchMessages = async () => {
            try {
              const response = await apiService.get('/chats/chat-123/messages');
              setMessages(response.data);
            } catch (error) {
              logger.error('Failed to fetch messages:', { error });
            }
          };
          fetchMessages();
        }, []);

        return (
          <div testID="messages-list">
            {messages.map((message: unknown) => (
              <div key={message.id} testID={`message-${message.id}`}>
                {message.text}
              </div>
            ))}
          </div>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('message-1')).toBeTruthy();
        expect(getByTestId('message-2')).toBeTruthy();
      });

      expect(apiService.get).toHaveBeenCalledWith('/chats/chat-123/messages');
    });

    it('should send chat message', async () => {
      const messageData = {
        text: 'Hello from test!',
        chatId: 'chat-123',
      };

      const mockResponse = {
        id: '3',
        ...messageData,
        senderId: 'user1',
        timestamp: new Date().toISOString(),
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        data: mockResponse,
        status: 201,
      });

      const TestComponent = () => {
        const [message, setMessage] = React.useState(null);

        React.useEffect(() => {
          const sendMessage = async () => {
            try {
              const response = await apiService.post('/chats/messages', messageData);
              setMessage(response.data);
            } catch (error) {
              logger.error('Failed to send message:', { error });
            }
          };
          sendMessage();
        }, []);

        if (!message) return null;
        return <div testID="sent-message">{message.text}</div>;
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('sent-message')).toBeTruthy();
      });

      expect(apiService.post).toHaveBeenCalledWith('/chats/messages', messageData);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (apiService.get as jest.Mock).mockRejectedValue({
        message: 'Network Error',
        code: 'NETWORK_ERROR',
      });

      const TestComponent = () => {
        const [error, setError] = React.useState(null);

        React.useEffect(() => {
          const fetchData = async () => {
            try {
              await apiService.get('/pets');
            } catch (err) {
              setError(err.message);
            }
          };
          fetchData();
        }, []);

        if (!error) return null;
        return <div testID="network-error">{error}</div>;
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('network-error')).toBeTruthy();
      });
    });

    it('should handle server errors', async () => {
      (apiService.get as jest.Mock).mockRejectedValue({
        response: {
          data: { message: 'Internal Server Error' },
          status: 500,
        },
      });

      const TestComponent = () => {
        const [error, setError] = React.useState(null);

        React.useEffect(() => {
          const fetchData = async () => {
            try {
              await apiService.get('/pets');
            } catch (err) {
              setError(err.response.data.message);
            }
          };
          fetchData();
        }, []);

        if (!error) return null;
        return <div testID="server-error">{error}</div>;
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('server-error')).toBeTruthy();
      });
    });

    it('should handle timeout errors', async () => {
      (apiService.get as jest.Mock).mockRejectedValue({
        message: 'Request timeout',
        code: 'TIMEOUT',
      });

      const TestComponent = () => {
        const [error, setError] = React.useState(null);

        React.useEffect(() => {
          const fetchData = async () => {
            try {
              await apiService.get('/pets');
            } catch (err) {
              setError(err.message);
            }
          };
          fetchData();
        }, []);

        if (!error) return null;
        return <div testID="timeout-error">{error}</div>;
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('timeout-error')).toBeTruthy();
      });
    });
  });
});
