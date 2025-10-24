/**
 * E2E Test: Authentication Flow
 * 
 * Tests user registration, login, and logout workflows.
 * Focus: API requests, data flow, UI state changes (NOT styling)
 */

describe('Authentication Flow', () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPass123!@#';

  beforeEach(() => {
    cy.visit('/');
    cy.logout(); // Clear any existing session
  });

  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      cy.visit('/register');

      // Intercept the registration API call
      cy.intercept('POST', '**/api/auth/register').as('registerRequest');

      // Fill out the registration form
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="dateOfBirth"]').type('1990-01-01');

      // Submit the form
      cy.contains('button', /sign up|register/i).click();

      // Verify API request was made with correct data
      cy.wait('@registerRequest').then((interception) => {
        expect(interception.request.body).to.have.property('email', testEmail);
        expect(interception.request.body).to.have.property('password', testPassword);
        expect(interception.request.body).to.have.property('firstName', 'Test');
        expect(interception.request.body).to.have.property('lastName', 'User');
        expect(interception.response?.statusCode).to.eq(201);
      });

      // Verify response structure
      cy.wait('@registerRequest').then((interception) => {
        const response = interception.response?.body;
        expect(response).to.have.property('success', true);
        expect(response.data).to.have.property('user');
        expect(response.data).to.have.property('accessToken');
        expect(response.data).to.have.property('refreshToken');
        expect(response.data.user).to.have.property('email', testEmail);
      });

      // Verify redirect to dashboard or home
      cy.url().should('not.include', '/register');
      cy.url().should('match', /\/(dashboard|swipe|discover)/);
    });

    it('should show error for duplicate email', () => {
      // Register first time
      cy.register({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
      });

      cy.visit('/register');

      cy.intercept('POST', '**/api/auth/register').as('duplicateRegister');

      // Try to register with same email
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="dateOfBirth"]').type('1990-01-01');

      cy.contains('button', /sign up|register/i).click();

      // Verify error response
      cy.wait('@duplicateRegister').then((interception) => {
        expect(interception.response?.statusCode).to.eq(400);
        expect(interception.response?.body.message).to.include('already exists');
      });

      // Verify error message is displayed
      cy.contains(/already exists|duplicate/i).should('be.visible');
    });

    it('should show validation error for invalid email', () => {
      cy.visit('/register');

      cy.intercept('POST', '**/api/auth/register').as('invalidEmailRegister');

      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type(testPassword);
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="dateOfBirth"]').type('1990-01-01');

      cy.contains('button', /sign up|register/i).click();

      // Either client-side validation prevents submission or server returns 400
      cy.wait('@invalidEmailRegister', { timeout: 1000 }).then((interception) => {
        expect(interception.response?.statusCode).to.eq(400);
      }).catch(() => {
        // Client-side validation caught it
        cy.contains(/invalid|email/i).should('exist');
      });
    });

    it('should show validation error for weak password', () => {
      cy.visit('/register');

      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('123'); // Too short
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="dateOfBirth"]').type('1990-01-01');

      cy.contains('button', /sign up|register/i).click();

      // Verify validation error is shown
      cy.contains(/password.*least|too short|weak password/i).should('be.visible');
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Create a user for login tests
      cy.register({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
      });
      cy.logout();
    });

    it('should login with correct credentials', () => {
      cy.visit('/login');

      cy.intercept('POST', '**/api/auth/login').as('loginRequest');

      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.contains('button', /log in|sign in/i).click();

      // Verify API request
      cy.wait('@loginRequest').then((interception) => {
        expect(interception.request.body).to.have.property('email', testEmail);
        expect(interception.request.body).to.have.property('password', testPassword);
        expect(interception.response?.statusCode).to.eq(200);
      });

      // Verify response structure
      cy.wait('@loginRequest').then((interception) => {
        const response = interception.response?.body;
        expect(response).to.have.property('success', true);
        expect(response.data).to.have.property('user');
        expect(response.data).to.have.property('accessToken');
        expect(response.data.user).to.have.property('email', testEmail);
      });

      // Verify redirect to protected route
      cy.url().should('not.include', '/login');
    });

    it('should show error for incorrect password', () => {
      cy.visit('/login');

      cy.intercept('POST', '**/api/auth/login').as('failedLogin');

      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type('WrongPassword123!');
      cy.contains('button', /log in|sign in/i).click();

      // Verify error response
      cy.wait('@failedLogin').then((interception) => {
        expect(interception.response?.statusCode).to.eq(401);
        expect(interception.response?.body.message).to.include('Invalid credentials');
      });

      // Verify error message displayed
      cy.contains(/invalid.*credentials|incorrect/i).should('be.visible');
    });

    it('should show error for non-existent email', () => {
      cy.visit('/login');

      cy.intercept('POST', '**/api/auth/login').as('nonExistentLogin');

      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.get('input[name="password"]').type(testPassword);
      cy.contains('button', /log in|sign in/i).click();

      // Verify error response
      cy.wait('@nonExistentLogin').then((interception) => {
        expect(interception.response?.statusCode).to.eq(401);
      });

      // Verify error message displayed
      cy.contains(/invalid.*credentials|not found/i).should('be.visible');
    });
  });

  describe('User Logout', () => {
    beforeEach(() => {
      cy.register({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
      });
      cy.login(testEmail, testPassword);
    });

    it('should logout successfully', () => {
      cy.visit('/dashboard');

      cy.intercept('POST', '**/api/auth/logout').as('logoutRequest');

      // Find and click logout button (could be in nav, menu, etc.)
      cy.contains('button', /log out|sign out/i).click();

      // Verify API request
      cy.wait('@logoutRequest').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
      });

      // Verify redirect to public page
      cy.url().should('match', /\/(login|$)/);

      // Verify token is cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without auth', () => {
      cy.visit('/dashboard');

      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should access protected route when authenticated', () => {
      cy.register({
        email: testEmail,
        password: testPassword,
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
      });
      cy.login(testEmail, testPassword);

      cy.visit('/dashboard');

      // Should stay on dashboard
      cy.url().should('include', '/dashboard');
    });
  });
});

