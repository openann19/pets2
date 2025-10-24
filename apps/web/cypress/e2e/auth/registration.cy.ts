/**
 * E2E Tests for User Registration
 * Comprehensive testing of the registration flow
 */

describe('User Registration', () => {
  beforeEach(() => {
    cy.clearAllStorage();
    cy.clearCookies();
    cy.visit('/register');
  });

  describe('Registration Form', () => {
    it('should display all required form fields', () => {
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
      cy.get('input[name="firstName"]').should('be.visible');
      cy.get('input[name="lastName"]').should('be.visible');
      cy.get('input[name="dateOfBirth"]').should('be.visible');
      cy.get('input[name="terms"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
      cy.get('button[type="submit"]').click();

      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
      cy.contains('First name is required').should('be.visible');
      cy.contains('Last name is required').should('be.visible');
      cy.contains('Date of birth is required').should('be.visible');
      cy.contains('You must accept the terms').should('be.visible');
    });

    it('should validate email format', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('ValidPassword123!');
      cy.get('input[name="confirmPassword"]').type('ValidPassword123!');
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="dateOfBirth"]').type('1990-01-01');
      cy.get('input[name="terms"]').check();
      cy.get('button[type="submit"]').click();

      cy.contains('Please enter a valid email').should('be.visible');
    });

    it('should validate password strength', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('weak');
      cy.get('input[name="confirmPassword"]').type('weak');
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="dateOfBirth"]').type('1990-01-01');
      cy.get('input[name="terms"]').check();
      cy.get('button[type="submit"]').click();

      cy.contains('Password must be at least 8 characters').should('be.visible');
    });

    it('should validate password confirmation', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('ValidPassword123!');
      cy.get('input[name="confirmPassword"]').type('DifferentPassword123!');
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="dateOfBirth"]').type('1990-01-01');
      cy.get('input[name="terms"]').check();
      cy.get('button[type="submit"]').click();

      cy.contains('Passwords do not match').should('be.visible');
    });

    it('should validate age requirement', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('ValidPassword123!');
      cy.get('input[name="confirmPassword"]').type('ValidPassword123!');
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="dateOfBirth"]').type(futureDateString);
      cy.get('input[name="terms"]').check();
      cy.get('button[type="submit"]').click();

      cy.contains('You must be at least 18 years old').should('be.visible');
    });
  });

  describe('Successful Registration', () => {
    it('should register a new user successfully', () => {
      const timestamp = Date.now();
      const testUser = {
        email: `test${timestamp}@pawfectmatch.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
      };

      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('input[name="confirmPassword"]').type(testUser.password);
      cy.get('input[name="firstName"]').type(testUser.firstName);
      cy.get('input[name="lastName"]').type(testUser.lastName);
      cy.get('input[name="dateOfBirth"]').type(testUser.dateOfBirth);
      cy.get('input[name="terms"]').check();
      cy.get('button[type="submit"]').click();

      // Should redirect to onboarding or swipe page
      cy.url().should('match', /\/(onboarding|swipe)/);

      // Should show success message
      cy.contains('Welcome to PawfectMatch!').should('be.visible');
    });

    it('should send verification email', () => {
      const timestamp = Date.now();
      const testUser = {
        email: `test${timestamp}@pawfectmatch.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
      };

      cy.intercept('POST', '**/auth/register', { fixture: 'registration-success.json' }).as(
        'register',
      );
      cy.intercept('POST', '**/auth/send-verification', { statusCode: 200 }).as('sendVerification');

      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('input[name="confirmPassword"]').type(testUser.password);
      cy.get('input[name="firstName"]').type(testUser.firstName);
      cy.get('input[name="lastName"]').type(testUser.lastName);
      cy.get('input[name="dateOfBirth"]').type(testUser.dateOfBirth);
      cy.get('input[name="terms"]').check();
      cy.get('button[type="submit"]').click();

      cy.wait('@register');
      cy.wait('@sendVerification');

      cy.contains('Please check your email to verify your account').should('be.visible');
    });
  });

  describe('Registration Errors', () => {
    it('should handle duplicate email error', () => {
      cy.intercept('POST', '**/auth/register', {
        statusCode: 400,
        body: { message: 'Email already exists' },
      }).as('registerError');

      cy.get('input[name="email"]').type('existing@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('input[name="confirmPassword"]').type('TestPassword123!');
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="dateOfBirth"]').type('1990-01-01');
      cy.get('input[name="terms"]').check();
      cy.get('button[type="submit"]').click();

      cy.wait('@registerError');
      cy.contains('Email already exists').should('be.visible');
    });

    it('should handle server error gracefully', () => {
      cy.intercept('POST', '**/auth/register', {
        statusCode: 500,
        body: { message: 'Internal server error' },
      }).as('serverError');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('input[name="confirmPassword"]').type('TestPassword123!');
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="dateOfBirth"]').type('1990-01-01');
      cy.get('input[name="terms"]').check();
      cy.get('button[type="submit"]').click();

      cy.wait('@serverError');
      cy.contains('Something went wrong. Please try again.').should('be.visible');
    });

    it('should handle network error gracefully', () => {
      cy.intercept('POST', '**/auth/register', { forceNetworkError: true }).as('networkError');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('input[name="confirmPassword"]').type('TestPassword123!');
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="dateOfBirth"]').type('1990-01-01');
      cy.get('input[name="terms"]').check();
      cy.get('button[type="submit"]').click();

      cy.wait('@networkError');
      cy.contains('Network error. Please check your connection.').should('be.visible');
    });
  });

  describe('Registration Flow', () => {
    it('should navigate to login page', () => {
      cy.get('[data-testid="login-link"]').click();
      cy.url().should('include', '/login');
    });

    it('should show password strength indicator', () => {
      cy.get('input[name="password"]').type('weak');
      cy.get('[data-testid="password-strength"]').should('contain', 'Weak');

      cy.get('input[name="password"]').clear().type('StrongPassword123!');
      cy.get('[data-testid="password-strength"]').should('contain', 'Strong');
    });

    it('should toggle password visibility', () => {
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('[data-testid="password-toggle"]').click();

      cy.get('input[name="password"]').should('have.attr', 'type', 'text');

      cy.get('[data-testid="password-toggle"]').click();
      cy.get('input[name="password"]').should('have.attr', 'type', 'password');
    });

    it('should show terms and conditions modal', () => {
      cy.get('[data-testid="terms-link"]').click();
      cy.get('[data-testid="terms-modal"]').should('be.visible');
      cy.contains('Terms and Conditions').should('be.visible');

      cy.get('[data-testid="close-terms"]').click();
      cy.get('[data-testid="terms-modal"]').should('not.exist');
    });

    it('should show privacy policy modal', () => {
      cy.get('[data-testid="privacy-link"]').click();
      cy.get('[data-testid="privacy-modal"]').should('be.visible');
      cy.contains('Privacy Policy').should('be.visible');

      cy.get('[data-testid="close-privacy"]').click();
      cy.get('[data-testid="privacy-modal"]').should('not.exist');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen readers', () => {
      cy.checkPageA11y();
    });

    it('should support keyboard navigation', () => {
      cy.get('input[name="email"]').focus();
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="email"]').tab();
      cy.get('input[name="password"]').should('be.focused');
    });

    it('should have proper ARIA labels', () => {
      cy.get('input[name="email"]').should('have.attr', 'aria-label');
      cy.get('input[name="password"]').should('have.attr', 'aria-label');
      cy.get('button[type="submit"]').should('have.attr', 'aria-label');
    });
  });

  describe('Performance', () => {
    it('should load registration page quickly', () => {
      cy.measurePageLoad('/register');
    });

    it('should handle form submission efficiently', () => {
      const startTime = Date.now();

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('input[name="confirmPassword"]').type('TestPassword123!');
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="dateOfBirth"]').type('1990-01-01');
      cy.get('input[name="terms"]').check();
      cy.get('button[type="submit"]').click();

      cy.then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        expect(duration).to.be.lessThan(1000);
      });
    });
  });
});
