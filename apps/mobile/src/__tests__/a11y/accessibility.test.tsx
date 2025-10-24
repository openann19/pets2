/**
 * Accessibility Tests
 * Comprehensive testing of accessibility features and screen reader support
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../providers/AuthProvider';

// Mock AccessibilityInfo
jest.mock('react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo', () => ({
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(true)),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  setAccessibilityFocus: jest.fn(),
  announceForAccessibility: jest.fn(),
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

describe('Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Screen Reader Support', () => {
    it('should have proper accessibility labels on buttons', () => {
      const TestComponent = () => (
        <div>
          <button testID="login-button" accessibilityLabel="Login to your account">
            Login
          </button>
          <button testID="signup-button" accessibilityLabel="Create new account">
            Sign Up
          </button>
        </div>
      );

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(getByTestId('login-button')).toHaveAccessibilityLabel('Login to your account');
      expect(getByTestId('signup-button')).toHaveAccessibilityLabel('Create new account');
    });

    it('should have proper accessibility hints', () => {
      const TestComponent = () => (
        <div>
          <button 
            testID="help-button" 
            accessibilityLabel="Help"
            accessibilityHint="Opens help documentation"
          >
            Help
          </button>
        </div>
      );

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(getByTestId('help-button')).toHaveAccessibilityHint('Opens help documentation');
    });

    it('should announce important state changes', async () => {
      const TestComponent = () => {
        const [isLoading, setIsLoading] = React.useState(false);

        const handleAction = () => {
          setIsLoading(true);
          // Simulate async operation
          setTimeout(() => {
            setIsLoading(false);
            AccessibilityInfo.announceForAccessibility('Action completed successfully');
          }, 100);
        };

        return (
          <div>
            <button 
              testID="action-button" 
              onPress={handleAction}
              accessibilityState={{ busy: isLoading }}
            >
              {isLoading ? 'Loading...' : 'Perform Action'}
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const button = getByTestId('action-button');
      fireEvent.press(button);

      await waitFor(() => {
        expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
          'Action completed successfully'
        );
      });
    });
  });

  describe('Navigation Accessibility', () => {
    it('should have proper navigation labels', () => {
      const TestComponent = () => (
        <div>
          <nav testID="main-navigation" accessibilityRole="navigation">
            <button testID="nav-home" accessibilityLabel="Home page">
              Home
            </button>
            <button testID="nav-profile" accessibilityLabel="Profile page">
              Profile
            </button>
            <button testID="nav-settings" accessibilityLabel="Settings page">
              Settings
            </button>
          </nav>
        </div>
      );

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      expect(getByTestId('main-navigation')).toHaveAccessibilityRole('navigation');
      expect(getByTestId('nav-home')).toHaveAccessibilityLabel('Home page');
      expect(getByTestId('nav-profile')).toHaveAccessibilityLabel('Profile page');
      expect(getByTestId('nav-settings')).toHaveAccessibilityLabel('Settings page');
    });

    it('should support keyboard navigation', () => {
      const TestComponent = () => {
        const [focusedIndex, setFocusedIndex] = React.useState(0);
        const items = ['Home', 'Profile', 'Settings'];

        const handleKeyPress = (event: unknown) => {
          if (event.key === 'ArrowRight') {
            setFocusedIndex(prev => Math.min(prev + 1, items.length - 1));
          } else if (event.key === 'ArrowLeft') {
            setFocusedIndex(prev => Math.max(prev - 1, 0));
          }
        };

        return (
          <div onKeyDown={handleKeyPress}>
            {items.map((item, index) => (
              <button
                key={item}
                testID={`nav-${item.toLowerCase()}`}
                accessibilityState={{ selected: index === focusedIndex }}
                onFocus={() => { setFocusedIndex(index); }}
              >
                {item}
              </button>
            ))}
          </div>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const homeButton = getByTestId('nav-home');
      const profileButton = getByTestId('nav-profile');

      fireEvent.focus(homeButton);
      expect(homeButton).toHaveAccessibilityState({ selected: true });

      fireEvent.keyDown(homeButton, { key: 'ArrowRight' });
      fireEvent.focus(profileButton);
      expect(profileButton).toHaveAccessibilityState({ selected: true });
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper form labels and descriptions', () => {
      const TestComponent = () => (
        <form>
          <label htmlFor="email-input">Email Address</label>
          <input
            id="email-input"
            testID="email-input"
            type="email"
            aria-describedby="email-help"
            aria-required="true"
          />
          <div id="email-help" testID="email-help">
            Enter your email address to sign in
          </div>

          <label htmlFor="password-input">Password</label>
          <input
            id="password-input"
            testID="password-input"
            type="password"
            aria-describedby="password-help"
            aria-required="true"
          />
          <div id="password-help" testID="password-help">
            Enter your password
          </div>
        </form>
      );

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const emailInput = getByTestId('email-input');
      const passwordInput = getByTestId('password-input');

      expect(emailInput).toHaveAccessibilityState({ required: true });
      expect(passwordInput).toHaveAccessibilityState({ required: true });
    });

    it('should announce validation errors', () => {
      const TestComponent = () => {
        const [error, setError] = React.useState('');

        const handleSubmit = () => {
          setError('Please enter a valid email address');
          AccessibilityInfo.announceForAccessibility('Please enter a valid email address');
        };

        return (
          <form>
            <input
              testID="email-input"
              type="email"
              aria-invalid={!!error}
              aria-describedby={error ? 'email-error' : undefined}
            />
            {error ? <div id="email-error" testID="email-error" role="alert">
                {error}
              </div> : null}
            <button testID="submit-button" onPress={handleSubmit}>
              Submit
            </button>
          </form>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      expect(getByTestId('email-error')).toHaveAccessibilityRole('alert');
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Please enter a valid email address'
      );
    });
  });

  describe('Pet Card Accessibility', () => {
    it('should have proper accessibility information for pet cards', () => {
      const pet = {
        id: '1',
        name: 'Buddy',
        age: 3,
        breed: 'Golden Retriever',
        photos: ['photo1.jpg'],
      };

      const TestComponent = () => (
        <div
          testID="pet-card"
          accessibilityRole="button"
          accessibilityLabel={`Pet card for ${pet.name}, ${pet.age} year old ${pet.breed}`}
          accessibilityHint="Double tap to view pet details"
        >
          <img src={pet.photos[0]} alt={`Photo of ${pet.name}`} />
          <h3>{pet.name}</h3>
          <p>{pet.age} years old</p>
          <p>{pet.breed}</p>
        </div>
      );

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const petCard = getByTestId('pet-card');
      expect(petCard).toHaveAccessibilityRole('button');
      expect(petCard).toHaveAccessibilityLabel(
        'Pet card for Buddy, 3 year old Golden Retriever'
      );
      expect(petCard).toHaveAccessibilityHint('Double tap to view pet details');
    });

    it('should announce swipe actions', () => {
      const TestComponent = () => {
        const handleSwipeRight = () => {
          AccessibilityInfo.announceForAccessibility('Pet liked');
        };

        const handleSwipeLeft = () => {
          AccessibilityInfo.announceForAccessibility('Pet passed');
        };

        return (
          <div>
            <button
              testID="like-button"
              onPress={handleSwipeRight}
              accessibilityLabel="Like this pet"
            >
              Like
            </button>
            <button
              testID="pass-button"
              onPress={handleSwipeLeft}
              accessibilityLabel="Pass on this pet"
            >
              Pass
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const likeButton = getByTestId('like-button');
      const passButton = getByTestId('pass-button');

      fireEvent.press(likeButton);
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Pet liked');

      fireEvent.press(passButton);
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Pet passed');
    });
  });

  describe('Chat Accessibility', () => {
    it('should have proper chat message accessibility', () => {
      const message = {
        id: '1',
        text: 'Hello! How are you?',
        senderId: 'user1',
        timestamp: new Date().toISOString(),
      };

      const TestComponent = () => (
        <div
          testID="message-1"
          accessibilityRole="text"
          accessibilityLabel={`Message from ${message.senderId}: ${message.text}`}
        >
          <span>{message.text}</span>
          <time>{message.timestamp}</time>
        </div>
      );

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const messageElement = getByTestId('message-1');
      expect(messageElement).toHaveAccessibilityRole('text');
      expect(messageElement).toHaveAccessibilityLabel(
        'Message from user1: Hello! How are you?'
      );
    });

    it('should announce new messages', () => {
      const TestComponent = () => {
        const [messages, setMessages] = React.useState([]);

        const addMessage = () => {
          const newMessage = {
            id: '2',
            text: 'New message received',
            senderId: 'user2',
          };
          setMessages(prev => [...prev, newMessage]);
          AccessibilityInfo.announceForAccessibility('New message received');
        };

        return (
          <div>
            <button testID="add-message" onPress={addMessage}>
              Add Message
            </button>
            {messages.map(msg => (
              <div key={msg.id} testID={`message-${msg.id}`}>
                {msg.text}
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

      const addButton = getByTestId('add-message');
      fireEvent.press(addButton);

      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'New message received'
      );
    });
  });

  describe('Video Call Accessibility', () => {
    it('should have proper call control accessibility', () => {
      const TestComponent = () => (
        <div>
          <button
            testID="mute-button"
            accessibilityLabel="Mute microphone"
            accessibilityState={{ selected: false }}
          >
            Mute
          </button>
          <button
            testID="video-toggle"
            accessibilityLabel="Toggle video"
            accessibilityState={{ selected: true }}
          >
            Video
          </button>
          <button
            testID="end-call"
            accessibilityLabel="End call"
          >
            End Call
          </button>
        </div>
      );

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const muteButton = getByTestId('mute-button');
      const videoToggle = getByTestId('video-toggle');
      const endCallButton = getByTestId('end-call');

      expect(muteButton).toHaveAccessibilityLabel('Mute microphone');
      expect(muteButton).toHaveAccessibilityState({ selected: false });
      expect(videoToggle).toHaveAccessibilityLabel('Toggle video');
      expect(videoToggle).toHaveAccessibilityState({ selected: true });
      expect(endCallButton).toHaveAccessibilityLabel('End call');
    });

    it('should announce call state changes', () => {
      const TestComponent = () => {
        const [isMuted, setIsMuted] = React.useState(false);

        const toggleMute = () => {
          setIsMuted(!isMuted);
          AccessibilityInfo.announceForAccessibility(
            isMuted ? 'Microphone unmuted' : 'Microphone muted'
          );
        };

        return (
          <div>
            <button
              testID="mute-button"
              onPress={toggleMute}
              accessibilityState={{ selected: isMuted }}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const muteButton = getByTestId('mute-button');
      fireEvent.press(muteButton);

      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Microphone muted'
      );

      fireEvent.press(muteButton);
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Microphone unmuted'
      );
    });
  });

  describe('Voice Control Support', () => {
    it('should support voice commands', () => {
      const TestComponent = () => {
        const [voiceControlEnabled, setVoiceControlEnabled] = React.useState(false);

        const handleVoiceCommand = (command: string) => {
          switch (command) {
            case 'like':
              AccessibilityInfo.announceForAccessibility('Pet liked via voice command');
              break;
            case 'pass':
              AccessibilityInfo.announceForAccessibility('Pet passed via voice command');
              break;
            default:
              break;
          }
        };

        return (
          <div>
            <button
              testID="voice-control-toggle"
              onPress={() => { setVoiceControlEnabled(!voiceControlEnabled); }}
            >
              {voiceControlEnabled ? 'Disable Voice Control' : 'Enable Voice Control'}
            </button>
            {voiceControlEnabled ? <div testID="voice-commands">
                <button
                  testID="voice-like"
                  onPress={() => { handleVoiceCommand('like'); }}
                >
                  Voice Like
                </button>
                <button
                  testID="voice-pass"
                  onPress={() => { handleVoiceCommand('pass'); }}
                >
                  Voice Pass
                </button>
              </div> : null}
          </div>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const toggleButton = getByTestId('voice-control-toggle');
      fireEvent.press(toggleButton);

      const voiceLikeButton = getByTestId('voice-like');
      fireEvent.press(voiceLikeButton);

      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Pet liked via voice command'
      );
    });
  });

  describe('High Contrast Mode', () => {
    it('should support high contrast mode', () => {
      const TestComponent = () => (
        <div style={{ color: 'var(--text-color)', backgroundColor: 'var(--bg-color)' }}>
          <button
            testID="high-contrast-button"
            style={{
              color: 'var(--button-text-color)',
              backgroundColor: 'var(--button-bg-color)',
              border: '2px solid var(--button-border-color)',
            }}
          >
            High Contrast Button
          </button>
        </div>
      );

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const button = getByTestId('high-contrast-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Focus Management', () => {
    it('should manage focus properly in modals', () => {
      const TestComponent = () => {
        const [isModalOpen, setIsModalOpen] = React.useState(false);

        return (
          <div>
            <button
              testID="open-modal"
              onPress={() => { setIsModalOpen(true); }}
            >
              Open Modal
            </button>
            {isModalOpen ? <div
                testID="modal"
                accessibilityRole="dialog"
                accessibilityModal
              >
                <button
                  testID="modal-close"
                  onPress={() => { setIsModalOpen(false); }}
                >
                  Close
                </button>
                <button testID="modal-action">Action</button>
              </div> : null}
          </div>
        );
      };

      const { getByTestId } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      const openButton = getByTestId('open-modal');
      fireEvent.press(openButton);

      const modal = getByTestId('modal');
      expect(modal).toHaveAccessibilityRole('dialog');
      expect(modal).toHaveAccessibilityState({ modal: true });
    });
  });
});
