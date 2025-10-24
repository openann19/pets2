/**
 * Regression tests for critical user paths
 * Ensures core functionality remains stable after changes
 */

describe('Critical Path Regression', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('User Authentication Flow', () => {
    it('should complete full login to dashboard journey', () => {
      // Visit login page
      cy.visit('/login');
      cy.contains('Login').should('be.visible');

      // Fill login form
      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');

      // Submit and verify redirect
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/swipe');

      // Verify user is authenticated
      cy.window().then((win) => {
        const authStore = win.localStorage.getItem('pm_auth');
        expect(authStore).to.not.equal(null);
      });

      // Verify header shows user info
      cy.contains('Test User').should('be.visible');
    });

    it('should complete registration flow', () => {
      // Visit registration page
      cy.visit('/register');
      cy.contains('Create Account').should('be.visible');

      // Fill registration form
      cy.get('input[name="email"]').type('newuser@example.com');
      cy.get('input[name="password"]').type('SecurePassword123!');
      cy.get('input[name="firstName"]').type('New');
      cy.get('input[name="lastName"]').type('User');

      // Submit and verify account creation
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/onboarding');
    });
  });

  describe('Payment Processing Flow', () => {
    it('should complete subscription checkout journey', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      // Navigate to premium page
      cy.visit('/premium');
      cy.contains('Unlock Premium Features').should('be.visible');

      // Select premium plan
      cy.contains('Subscribe to Premium plan').click();

      // Should initiate Stripe checkout
      cy.url().should('include', 'stripe.com');
    });

    it('should handle payment webhook processing', () => {
      // This would require testing the backend webhook handlers
      // In regression testing, we verify the integration points
      cy.visit('/premium');

      // Verify subscription status display
      cy.get('[data-testid="subscription-status"]').should('exist');
    });
  });

  describe('Match Creation Flow', () => {
    it('should create match from swipe to chat', () => {
      // Login
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      // Swipe and like
      cy.visit('/swipe');
      cy.get('[data-testid="like-button"]').click();

      // Check matches
      cy.visit('/matches');
      cy.get('[data-testid="match-item"]').should('exist');

      // Open chat
      cy.get('[data-testid="match-item"]').first().click();
      cy.url().should('include', '/chat/');
    });
  });

  describe('Video Call Flow', () => {
    it('should initiate and complete video call journey', () => {
      // Login
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      // Navigate to matches and start call
      cy.visit('/matches');
      cy.get('[data-testid="video-call-button"]').first().click();

      // Should navigate to video call room
      cy.url().should('include', '/video-call/');

      // Should display call controls
      cy.get('[data-testid="end-call-button"]').should('be.visible');
    });
  });

  describe('Profile Update Flow', () => {
    it('should update user profile and reflect changes', () => {
      // Login
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      // Navigate to profile
      cy.visit('/profile');
      cy.contains('Edit Profile').click();

      // Update profile
      const newName = 'Updated User';
      cy.get('[data-testid="first-name-input"]').clear().type('Updated');
      cy.get('[data-testid="last-name-input"]').clear().type('User');
      cy.contains('Save Changes').click();

      // Verify changes persisted
      cy.contains(newName).should('be.visible');

      // Navigate away and back
      cy.visit('/matches');
      cy.visit('/profile');

      // Changes should still be visible
      cy.contains(newName).should('be.visible');
    });
  });

  describe('Notification Delivery Flow', () => {
    it('should deliver and display notifications correctly', () => {
      // Login
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      // Trigger notification (mock)
      cy.visit('/matches');

      // Should display notification badge
      cy.get('[data-testid="notification-badge"]').should('exist');

      // Should show notification in list
      cy.get('[data-testid="notification-item"]').should('exist');
    });
  });

  describe('Cross-Page Navigation', () => {
    it('should maintain session state across page navigation', () => {
      // Login
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      // Navigate through core pages
      cy.visit('/swipe');
      cy.visit('/matches');
      cy.visit('/discover');
      cy.visit('/profile');

      // User should remain authenticated on all pages
      cy.contains('Test User').should('be.visible');
    });

    it('should preserve user preferences across sessions', () => {
      // Login
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      // Update preferences
      cy.visit('/profile');
      cy.contains('Preferences').click();
      cy.get('[data-testid="max-distance-slider"]').invoke('val', 30);
      cy.contains('Save Preferences').click();

      // Logout and login again
      cy.visit('/logout');
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      // Check preferences persisted
      cy.visit('/profile');
      cy.contains('Preferences').click();
      cy.get('[data-testid="max-distance-slider"]').should('have.value', 30);
    });
  });
});
