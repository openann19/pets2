/**
 * E2E Tests for Chat Messaging
 * Comprehensive testing of the chat functionality
 */

describe('Chat Messaging', () => {
  beforeEach(() => {
    cy.clearAllStorage();
    cy.clearCookies();
    cy.loginAsTestUser();
  });

  describe('Chat Interface', () => {
    it('should display chat list', () => {
      cy.visit('/matches');
      cy.get('[data-testid="matches-list"]').should('be.visible');
      cy.get('[data-testid="match-item"]').should('have.length.at.least', 1);
    });

    it('should navigate to chat screen', () => {
      cy.visit('/matches');
      cy.get('[data-testid="match-item"]').first().click();

      cy.url().should('include', '/chat/');
      cy.get('[data-testid="chat-screen"]').should('be.visible');
    });

    it('should display chat header', () => {
      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="chat-header"]').should('be.visible');
      cy.get('[data-testid="pet-name"]').should('be.visible');
      cy.get('[data-testid="pet-photo"]').should('be.visible');
      cy.get('[data-testid="back-button"]').should('be.visible');
    });

    it('should display message input', () => {
      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="message-input"]').should('be.visible');
      cy.get('[data-testid="send-button"]').should('be.visible');
      cy.get('[data-testid="attachment-button"]').should('be.visible');
    });
  });

  describe('Message Sending', () => {
    it('should send text message', () => {
      cy.intercept('POST', '**/chat/messages', { statusCode: 200 }).as('sendMessage');

      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="message-input"]').type('Hello! How are you?');
      cy.get('[data-testid="send-button"]').click();

      cy.wait('@sendMessage');
      cy.get('[data-testid="message"]').last().should('contain', 'Hello! How are you?');
    });

    it('should send message on Enter key', () => {
      cy.intercept('POST', '**/chat/messages', { statusCode: 200 }).as('sendMessage');

      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="message-input"]').type('Hello! How are you?{enter}');

      cy.wait('@sendMessage');
      cy.get('[data-testid="message"]').last().should('contain', 'Hello! How are you?');
    });

    it('should not send empty message', () => {
      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="send-button"]').click();

      cy.get('[data-testid="message"]').should('not.exist');
    });

    it('should clear input after sending message', () => {
      cy.intercept('POST', '**/chat/messages', { statusCode: 200 }).as('sendMessage');

      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="message-input"]').type('Hello! How are you?');
      cy.get('[data-testid="send-button"]').click();

      cy.wait('@sendMessage');
      cy.get('[data-testid="message-input"]').should('have.value', '');
    });

    it('should show message status', () => {
      cy.intercept('POST', '**/chat/messages', { statusCode: 200 }).as('sendMessage');

      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="message-input"]').type('Hello! How are you?');
      cy.get('[data-testid="send-button"]').click();

      cy.wait('@sendMessage');
      cy.get('[data-testid="message-status"]').last().should('contain', 'Sent');
    });
  });

  describe('Message Display', () => {
    it('should display sent messages', () => {
      cy.intercept('GET', '**/chat/messages', {
        statusCode: 200,
        body: {
          messages: [
            {
              id: 'msg-1',
              text: 'Hello! How are you?',
              sender: 'current-user',
              timestamp: '2024-01-15T10:00:00Z',
              status: 'sent',
            },
          ],
        },
      }).as('getMessages');

      cy.navigateToChat('test-match-id');
      cy.wait('@getMessages');

      cy.get('[data-testid="message"]').should('contain', 'Hello! How are you?');
      cy.get('[data-testid="message-timestamp"]').should('be.visible');
    });

    it('should display received messages', () => {
      cy.intercept('GET', '**/chat/messages', {
        statusCode: 200,
        body: {
          messages: [
            {
              id: 'msg-1',
              text: "Hi there! I'm doing great!",
              sender: 'other-user',
              timestamp: '2024-01-15T10:05:00Z',
              status: 'received',
            },
          ],
        },
      }).as('getMessages');

      cy.navigateToChat('test-match-id');
      cy.wait('@getMessages');

      cy.get('[data-testid="message"]').should('contain', "Hi there! I'm doing great!");
      cy.get('[data-testid="message"]').should('have.class', 'received');
    });

    it('should show message timestamps', () => {
      cy.intercept('GET', '**/chat/messages', {
        statusCode: 200,
        body: {
          messages: [
            {
              id: 'msg-1',
              text: 'Hello!',
              sender: 'current-user',
              timestamp: '2024-01-15T10:00:00Z',
            },
          ],
        },
      }).as('getMessages');

      cy.navigateToChat('test-match-id');
      cy.wait('@getMessages');

      cy.get('[data-testid="message-timestamp"]').should('be.visible');
      cy.get('[data-testid="message-timestamp"]').should('contain', '10:00');
    });

    it('should group messages by date', () => {
      cy.intercept('GET', '**/chat/messages', {
        statusCode: 200,
        body: {
          messages: [
            {
              id: 'msg-1',
              text: 'Hello!',
              sender: 'current-user',
              timestamp: '2024-01-15T10:00:00Z',
            },
            {
              id: 'msg-2',
              text: 'Hi there!',
              sender: 'other-user',
              timestamp: '2024-01-16T10:00:00Z',
            },
          ],
        },
      }).as('getMessages');

      cy.navigateToChat('test-match-id');
      cy.wait('@getMessages');

      cy.get('[data-testid="date-separator"]').should('have.length', 1);
      cy.get('[data-testid="date-separator"]').should('contain', 'January 16, 2024');
    });
  });

  describe('Real-time Messaging', () => {
    it('should receive new messages in real-time', () => {
      cy.navigateToChat('test-match-id');

      // Simulate receiving a new message
      cy.window().then((win) => {
        win.dispatchEvent(
          new CustomEvent('newMessage', {
            detail: {
              id: 'msg-new',
              text: 'This is a new message!',
              sender: 'other-user',
              timestamp: new Date().toISOString(),
            },
          }),
        );
      });

      cy.get('[data-testid="message"]').last().should('contain', 'This is a new message!');
    });

    it('should show typing indicator', () => {
      cy.navigateToChat('test-match-id');

      // Simulate typing indicator
      cy.window().then((win) => {
        win.dispatchEvent(
          new CustomEvent('typing', {
            detail: { sender: 'other-user', isTyping: true },
          }),
        );
      });

      cy.get('[data-testid="typing-indicator"]').should('be.visible');
      cy.get('[data-testid="typing-indicator"]').should('contain', 'is typing...');
    });

    it('should hide typing indicator when user stops typing', () => {
      cy.navigateToChat('test-match-id');

      // Show typing indicator
      cy.window().then((win) => {
        win.dispatchEvent(
          new CustomEvent('typing', {
            detail: { sender: 'other-user', isTyping: true },
          }),
        );
      });

      cy.get('[data-testid="typing-indicator"]').should('be.visible');

      // Hide typing indicator
      cy.window().then((win) => {
        win.dispatchEvent(
          new CustomEvent('typing', {
            detail: { sender: 'other-user', isTyping: false },
          }),
        );
      });

      cy.get('[data-testid="typing-indicator"]').should('not.exist');
    });

    it('should update message status in real-time', () => {
      cy.intercept('POST', '**/chat/messages', { statusCode: 200 }).as('sendMessage');

      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="message-input"]').type('Hello!');
      cy.get('[data-testid="send-button"]').click();

      cy.wait('@sendMessage');
      cy.get('[data-testid="message-status"]').last().should('contain', 'Sent');

      // Simulate message being read
      cy.window().then((win) => {
        win.dispatchEvent(
          new CustomEvent('messageRead', {
            detail: { messageId: 'msg-1' },
          }),
        );
      });

      cy.get('[data-testid="message-status"]').last().should('contain', 'Read');
    });
  });

  describe('Message Attachments', () => {
    it('should send image attachment', () => {
      cy.intercept('POST', '**/chat/messages', { statusCode: 200 }).as('sendImage');

      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="attachment-button"]').click();
      cy.get('[data-testid="image-option"]').click();

      // Mock file selection
      cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/test-image.jpg', {
        force: true,
      });
      cy.get('[data-testid="send-button"]').click();

      cy.wait('@sendImage');
      cy.get('[data-testid="message"]').last().should('contain', 'image');
    });

    it('should send location attachment', () => {
      cy.intercept('POST', '**/chat/messages', { statusCode: 200 }).as('sendLocation');

      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="attachment-button"]').click();
      cy.get('[data-testid="location-option"]').click();

      cy.get('[data-testid="confirm-location"]').click();
      cy.get('[data-testid="send-button"]').click();

      cy.wait('@sendLocation');
      cy.get('[data-testid="message"]').last().should('contain', 'location');
    });

    it('should preview attachment before sending', () => {
      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="attachment-button"]').click();
      cy.get('[data-testid="image-option"]').click();

      cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/test-image.jpg', {
        force: true,
      });
      cy.get('[data-testid="attachment-preview"]').should('be.visible');
      cy.get('[data-testid="attachment-preview"]').should('contain', 'test-image.jpg');
    });

    it('should cancel attachment sending', () => {
      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="attachment-button"]').click();
      cy.get('[data-testid="image-option"]').click();

      cy.get('[data-testid="file-input"]').selectFile('cypress/fixtures/test-image.jpg', {
        force: true,
      });
      cy.get('[data-testid="cancel-attachment"]').click();

      cy.get('[data-testid="attachment-preview"]').should('not.exist');
    });
  });

  describe('Message Actions', () => {
    it('should copy message text', () => {
      cy.intercept('GET', '**/chat/messages', {
        statusCode: 200,
        body: {
          messages: [
            {
              id: 'msg-1',
              text: 'Hello! How are you?',
              sender: 'other-user',
              timestamp: '2024-01-15T10:00:00Z',
            },
          ],
        },
      }).as('getMessages');

      cy.navigateToChat('test-match-id');
      cy.wait('@getMessages');

      cy.get('[data-testid="message"]').first().rightclick();
      cy.get('[data-testid="copy-option"]').click();

      cy.window().then((win) => {
        win.navigator.clipboard.readText().then((text) => {
          expect(text).to.equal('Hello! How are you?');
        });
      });
    });

    it('should delete own message', () => {
      cy.intercept('GET', '**/chat/messages', {
        statusCode: 200,
        body: {
          messages: [
            {
              id: 'msg-1',
              text: 'Hello!',
              sender: 'current-user',
              timestamp: '2024-01-15T10:00:00Z',
            },
          ],
        },
      }).as('getMessages');

      cy.intercept('DELETE', '**/chat/messages/msg-1', { statusCode: 200 }).as('deleteMessage');

      cy.navigateToChat('test-match-id');
      cy.wait('@getMessages');

      cy.get('[data-testid="message"]').first().rightclick();
      cy.get('[data-testid="delete-option"]').click();
      cy.get('[data-testid="confirm-delete"]').click();

      cy.wait('@deleteMessage');
      cy.get('[data-testid="message"]').should('not.exist');
    });

    it('should report inappropriate message', () => {
      cy.intercept('GET', '**/chat/messages', {
        statusCode: 200,
        body: {
          messages: [
            {
              id: 'msg-1',
              text: 'Inappropriate message',
              sender: 'other-user',
              timestamp: '2024-01-15T10:00:00Z',
            },
          ],
        },
      }).as('getMessages');

      cy.intercept('POST', '**/chat/report', { statusCode: 200 }).as('reportMessage');

      cy.navigateToChat('test-match-id');
      cy.wait('@getMessages');

      cy.get('[data-testid="message"]').first().rightclick();
      cy.get('[data-testid="report-option"]').click();
      cy.get('[data-testid="report-reason"]').select('Inappropriate content');
      cy.get('[data-testid="submit-report"]').click();

      cy.wait('@reportMessage');
      cy.contains('Message reported successfully').should('be.visible');
    });
  });

  describe('Chat Navigation', () => {
    it('should navigate back to matches list', () => {
      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="back-button"]').click();

      cy.url().should('include', '/matches');
      cy.get('[data-testid="matches-list"]').should('be.visible');
    });

    it('should navigate to pet profile from chat', () => {
      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="pet-photo"]').click();

      cy.url().should('include', '/profile/');
      cy.get('[data-testid="pet-profile"]').should('be.visible');
    });

    it('should show unread message count', () => {
      cy.intercept('GET', '**/matches', {
        statusCode: 200,
        body: {
          matches: [
            {
              id: 'match-1',
              pet: { name: 'Buddy' },
              unreadCount: 3,
              lastMessage: { text: 'Hello!' },
            },
          ],
        },
      }).as('getMatches');

      cy.visit('/matches');
      cy.wait('@getMatches');

      cy.get('[data-testid="unread-count"]').should('contain', '3');
    });
  });

  describe('Error Handling', () => {
    it('should handle message send failure', () => {
      cy.intercept('POST', '**/chat/messages', {
        statusCode: 500,
        body: { message: 'Failed to send message' },
      }).as('sendMessageError');

      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="message-input"]').type('Hello!');
      cy.get('[data-testid="send-button"]').click();

      cy.wait('@sendMessageError');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.contains('Failed to send message').should('be.visible');
    });

    it('should retry failed message sending', () => {
      cy.intercept('POST', '**/chat/messages', {
        statusCode: 500,
        body: { message: 'Failed to send message' },
      }).as('sendMessageError');

      cy.intercept('POST', '**/chat/messages', { statusCode: 200 }).as('sendMessageRetry');

      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="message-input"]').type('Hello!');
      cy.get('[data-testid="send-button"]').click();

      cy.wait('@sendMessageError');
      cy.get('[data-testid="retry-button"]').click();

      cy.wait('@sendMessageRetry');
      cy.get('[data-testid="message"]').last().should('contain', 'Hello!');
    });

    it('should handle network disconnection', () => {
      cy.navigateToChat('test-match-id');

      // Simulate network disconnection
      cy.window().then((win) => {
        win.dispatchEvent(new Event('offline'));
      });

      cy.get('[data-testid="connection-status"]').should('be.visible');
      cy.get('[data-testid="connection-status"]').should('contain', 'Offline');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen readers', () => {
      cy.navigateToChat('test-match-id');
      cy.checkPageA11y();
    });

    it('should support keyboard navigation', () => {
      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="message-input"]').focus();
      cy.get('[data-testid="message-input"]').type('Hello!');
      cy.get('[data-testid="message-input"]').tab();
      cy.get('[data-testid="send-button"]').should('be.focused');
    });

    it('should have proper ARIA labels', () => {
      cy.navigateToChat('test-match-id');
      cy.get('[data-testid="message-input"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="send-button"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="attachment-button"]').should('have.attr', 'aria-label');
    });
  });

  describe('Performance', () => {
    it('should load chat screen quickly', () => {
      cy.measurePageLoad('/chat/test-match-id');
    });

    it('should handle large message history efficiently', () => {
      cy.intercept('GET', '**/chat/messages', {
        statusCode: 200,
        body: {
          messages: Array.from({ length: 100 }, (_, i) => ({
            id: `msg-${i}`,
            text: `Message ${i}`,
            sender: i % 2 === 0 ? 'current-user' : 'other-user',
            timestamp: new Date(Date.now() - i * 60000).toISOString(),
          })),
        },
      }).as('getManyMessages');

      cy.navigateToChat('test-match-id');
      cy.wait('@getManyMessages');

      cy.get('[data-testid="message"]').should('have.length.at.least', 10);
    });
  });
});
