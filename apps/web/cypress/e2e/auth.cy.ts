/**
 * E2E tests for authentication flows
 * Updated for Next.js App Router
 */

describe('Authentication', () => {
  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Login', () => {
    it('should display login form', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show validation errors for invalid input', () => {
      cy.visit('/login');

      // Submit empty form
      cy.get('button[type="submit"]').click();
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');

      // Invalid email
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.contains('Invalid email').should('be.visible');
    });

    it('should login successfully with valid credentials', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      // Should redirect to swipe page
      cy.url().should('include', '/swipe');

      // Should store auth token
      cy.window().then((win) => {
        const authStore = win.localStorage.getItem('pm_auth');
        expect(authStore).to.not.equal(null);
      });
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type('wrong@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.contains('Invalid credentials').should('be.visible');
      cy.url().should('include', '/login');
    });
  });

  describe('Registration', () => {
    it('should display registration form', () => {
      cy.visit('/register');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should register new user successfully', () => {
      cy.visit('/register');

      const timestamp = Date.now();
      cy.get('input[name="email"]').type(`test${timestamp}@pawfectmatch.com`);
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[type="checkbox"]').check();
      cy.get('button[type="submit"]').click();

      // Should redirect to onboarding or swipe page
      cy.url().should('match', /\/(swipe|onboarding)/);
    });

    it('should show error for existing email', () => {
      cy.visit('/register');

      cy.get('input[name="email"]').type('existing@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[type="checkbox"]').check();
      cy.get('button[type="submit"]').click();

      cy.contains('Email already exists').should('be.visible');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Login before each logout test
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/swipe');
    });

    it('should logout successfully', () => {
      // Click logout button (adjust selector as needed)
      cy.get('[data-testid="logout-button"]').click();

      // Should redirect to login
      cy.url().should('include', '/login');

      // Should clear auth data
      cy.window().then((win) => {
        const authStore = win.localStorage.getItem('pm_auth');
        expect(authStore).to.equal(null);
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route while unauthenticated', () => {
      cy.visit('/swipe');
      cy.url().should('include', '/login');
      cy.url().should('include', 'redirect=%2Fswipe');
    });

    it('should allow access to protected route when authenticated', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      // Access protected route
      cy.visit('/matches');
      cy.url().should('include', '/matches');
    });
  });
});
