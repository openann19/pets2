/**
 * E2E tests for chat and messaging functionality
 * Covers real-time messaging, file uploads, and notifications
 */

describe('Chat & Messaging', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/login');

    // Login as test user
    cy.get('input[name="email"]').type('test@pawfectmatch.com');
    cy.get('input[name="password"]').type('TestPassword123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/swipe');
  });

  describe('Chat Interface', () => {
    it('should display chat list with matches', () => {
      cy.visit('/matches');

      // Should have at least one match for testing
      cy.get('[data-testid="match-item"]').should('have.length.greaterThan', 0);

      // Click on first match to open chat
      cy.get('[data-testid="match-item"]').first().click();

      // Should navigate to chat room
      cy.url().should('include', '/chat/');
    });

    it('should display chat messages', () => {
      cy.visit('/chat/test-match-123');

      // Should display message history
      cy.get('[data-testid="message-bubble"]').should('exist');

      // Check that messages are properly formatted
      cy.get('[data-testid="message-content"]').should('be.visible');
    });

    it('should show user avatars and names in chat', () => {
      cy.visit('/chat/test-match-123');

      // Should display user information
      cy.contains('Test User').should('be.visible');
      cy.get('[data-testid="user-avatar"]').should('exist');
    });
  });

  describe('Message Sending', () => {
    it('should send text messages', () => {
      cy.visit('/chat/test-match-123');

      // Type message
      cy.get('[data-testid="message-input"]').type('Hello, this is a test message!');

      // Send message
      cy.get('[data-testid="send-button"]').click();

      // Message should appear in chat
      cy.contains('Hello, this is a test message!').should('be.visible');
    });

    it('should send image attachments', () => {
      cy.visit('/chat/test-match-123');

      // Upload image
      cy.get('[data-testid="attachment-button"]').click();
      cy.get('[data-testid="image-upload"]').selectFile('cypress/fixtures/test-image.jpg');

      // Send attachment
      cy.get('[data-testid="send-button"]').click();

      // Image should appear in chat
      cy.get('[data-testid="image-attachment"]').should('exist');
    });

    it('should show typing indicators', () => {
      cy.visit('/chat/test-match-123');

      // Start typing
      cy.get('[data-testid="message-input"]').type('Testing typing indicator...');

      // Should show typing indicator for other user
      cy.get('[data-testid="typing-indicator"]').should('be.visible');
    });
  });

  describe('Message Management', () => {
    it('should delete messages', () => {
      cy.visit('/chat/test-match-123');

      // Find a message and open context menu
      cy.get('[data-testid="message-bubble"]').first().rightclick();

      // Click delete
      cy.contains('Delete').click();

      // Confirm deletion
      cy.contains('Yes, delete').click();

      // Message should be removed or marked as deleted
      cy.get('[data-testid="deleted-message"]').should('exist');
    });

    it('should edit messages', () => {
      cy.visit('/chat/test-match-123');

      // Find a message and open context menu
      cy.get('[data-testid="message-bubble"]').first().rightclick();

      // Click edit
      cy.contains('Edit').click();

      // Edit message content
      cy.get('[data-testid="edit-input"]').clear().type('Updated message content');

      // Save edit
      cy.get('[data-testid="save-edit"]').click();

      // Message should show updated content
      cy.contains('Updated message content').should('be.visible');
    });

    it('should show read receipts', () => {
      cy.visit('/chat/test-match-123');

      // Send a message
      cy.get('[data-testid="message-input"]').type('Test message for read receipt');
      cy.get('[data-testid="send-button"]').click();

      // Should show read receipt
      cy.get('[data-testid="read-receipt"]').should('exist');
    });
  });

  describe('Chat Notifications', () => {
    it('should receive new message notifications', () => {
      cy.visit('/chat/test-match-123');

      // Should show notification badge if unread messages exist
      cy.get('[data-testid="notification-badge"]').should('exist');
    });

    it('should mark messages as read when chat is opened', () => {
      cy.visit('/chat/test-match-123');

      // Notification badge should disappear after opening chat
      cy.get('[data-testid="notification-badge"]').should('not.exist');
    });
  });

  describe('Chat Performance', () => {
    it('should handle large message histories efficiently', () => {
      cy.visit('/chat/test-match-123');

      // Should load messages without freezing UI
      cy.get('[data-testid="message-bubble"]').should('have.length.greaterThan', 50);

      // UI should remain responsive
      cy.get('[data-testid="message-input"]').should('be.enabled');
    });

    it('should maintain real-time message delivery', () => {
      cy.visit('/chat/test-match-123');

      // Send message
      cy.get('[data-testid="message-input"]').type('Real-time test message');
      cy.get('[data-testid="send-button"]').click();

      // Message should appear instantly
      cy.contains('Real-time test message').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle network errors', () => {
      cy.visit('/chat/test-match-123');

      // Simulate network error
      cy.intercept('POST', '/api/messages', { statusCode: 500 });

      // Try to send message
      cy.get('[data-testid="message-input"]').type('Message with network error');
      cy.get('[data-testid="send-button"]').click();

      // Should show error message without breaking UI
      cy.contains('Failed to send message').should('be.visible');
    });

    it('should handle attachment upload errors', () => {
      cy.visit('/chat/test-match-123');

      // Simulate upload error
      cy.intercept('POST', '/api/upload', { statusCode: 500 });

      // Try to upload attachment
      cy.get('[data-testid="attachment-button"]').click();
      cy.get('[data-testid="image-upload"]').selectFile('cypress/fixtures/test-image.jpg');

      // Should show error message
      cy.contains('Failed to upload attachment').should('be.visible');
    });
  });
});
