/**
 * E2E Tests for User Login
 * Comprehensive testing of the login flow
 */

describe('User Login', () => {
  beforeEach(() => {
    cy.clearAllStorage();
    cy.clearCookies();
    cy.visit('/login');
  });

  describe('Login Form', () => {
    it('should display login form elements', () => {
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
      cy.get('button[type="submit"]').click();

      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('should validate email format', () => {
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.contains('Please enter a valid email').should('be.visible');
    });

    it('should show password requirements', () => {
      cy.get('input[name="password"]').focus();
      cy.get('[data-testid="password-requirements"]').should('be.visible');
    });
  });

  describe('Successful Login', () => {
    it('should login with valid credentials', () => {
      cy.intercept('POST', '**/auth/login', { fixture: 'login-success.json' }).as('login');

      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.url().should('include', '/swipe');
      cy.contains('Welcome back!').should('be.visible');
    });

    it('should store authentication token', () => {
      cy.intercept('POST', '**/auth/login', { fixture: 'login-success.json' }).as('login');

      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.window().then((win) => {
        const authStore = win.localStorage.getItem('pm_auth');
        expect(authStore).to.not.be.null;
        const authData = JSON.parse(authStore);
        expect(authData).to.have.property('accessToken');
        expect(authData).to.have.property('refreshToken');
      });
    });

    it('should redirect to intended page after login', () => {
      cy.visit('/matches');
      cy.url().should('include', '/login');
      cy.url().should('include', 'redirect=%2Fmatches');

      cy.intercept('POST', '**/auth/login', { fixture: 'login-success.json' }).as('login');

      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.url().should('include', '/matches');
    });
  });

  describe('Login Errors', () => {
    it('should show error for invalid credentials', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid email or password' },
      }).as('loginError');

      cy.get('input[name="email"]').type('wrong@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginError');
      cy.contains('Invalid email or password').should('be.visible');
      cy.url().should('include', '/login');
    });

    it('should show error for non-existent user', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 404,
        body: { message: 'User not found' },
      }).as('userNotFound');

      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@userNotFound');
      cy.contains('User not found').should('be.visible');
    });

    it('should handle account locked error', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 423,
        body: { message: 'Account is locked due to too many failed attempts' },
      }).as('accountLocked');

      cy.get('input[name="email"]').type('locked@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.wait('@accountLocked');
      cy.contains('Account is locked').should('be.visible');
      cy.contains('Please try again later').should('be.visible');
    });

    it('should handle server error gracefully', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 500,
        body: { message: 'Internal server error' },
      }).as('serverError');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@serverError');
      cy.contains('Something went wrong. Please try again.').should('be.visible');
    });

    it('should handle network error gracefully', () => {
      cy.intercept('POST', '**/auth/login', { forceNetworkError: true }).as('networkError');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@networkError');
      cy.contains('Network error. Please check your connection.').should('be.visible');
    });
  });

  describe('Password Reset', () => {
    it('should navigate to password reset page', () => {
      cy.get('[data-testid="forgot-password-link"]').click();
      cy.url().should('include', '/forgot-password');
    });

    it('should send password reset email', () => {
      cy.get('[data-testid="forgot-password-link"]').click();

      cy.intercept('POST', '**/auth/forgot-password', { statusCode: 200 }).as('forgotPassword');

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('button[type="submit"]').click();

      cy.wait('@forgotPassword');
      cy.contains('Password reset email sent').should('be.visible');
    });

    it('should handle invalid email for password reset', () => {
      cy.get('[data-testid="forgot-password-link"]').click();

      cy.intercept('POST', '**/auth/forgot-password', {
        statusCode: 404,
        body: { message: 'Email not found' },
      }).as('emailNotFound');

      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.get('button[type="submit"]').click();

      cy.wait('@emailNotFound');
      cy.contains('Email not found').should('be.visible');
    });
  });

  describe('Social Login', () => {
    it('should display social login options', () => {
      cy.get('[data-testid="google-login"]').should('be.visible');
      cy.get('[data-testid="facebook-login"]').should('be.visible');
      cy.get('[data-testid="apple-login"]').should('be.visible');
    });

    it('should handle Google login', () => {
      cy.intercept('POST', '**/auth/google', { fixture: 'google-login-success.json' }).as(
        'googleLogin',
      );

      cy.get('[data-testid="google-login"]').click();

      // Mock Google OAuth flow
      cy.window().then((win) => {
        win.postMessage(
          {
            type: 'GOOGLE_AUTH_SUCCESS',
            data: { accessToken: 'google-token' },
          },
          '*',
        );
      });

      cy.wait('@googleLogin');
      cy.url().should('include', '/swipe');
    });

    it('should handle Facebook login', () => {
      cy.intercept('POST', '**/auth/facebook', { fixture: 'facebook-login-success.json' }).as(
        'facebookLogin',
      );

      cy.get('[data-testid="facebook-login"]').click();

      // Mock Facebook OAuth flow
      cy.window().then((win) => {
        win.postMessage(
          {
            type: 'FACEBOOK_AUTH_SUCCESS',
            data: { accessToken: 'facebook-token' },
          },
          '*',
        );
      });

      cy.wait('@facebookLogin');
      cy.url().should('include', '/swipe');
    });

    it('should handle Apple login', () => {
      cy.intercept('POST', '**/auth/apple', { fixture: 'apple-login-success.json' }).as(
        'appleLogin',
      );

      cy.get('[data-testid="apple-login"]').click();

      // Mock Apple OAuth flow
      cy.window().then((win) => {
        win.postMessage(
          {
            type: 'APPLE_AUTH_SUCCESS',
            data: { accessToken: 'apple-token' },
          },
          '*',
        );
      });

      cy.wait('@appleLogin');
      cy.url().should('include', '/swipe');
    });
  });

  describe('Remember Me', () => {
    it('should remember user login', () => {
      cy.intercept('POST', '**/auth/login', { fixture: 'login-success.json' }).as('login');

      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('input[name="rememberMe"]').check();
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.window().then((win) => {
        const authStore = win.localStorage.getItem('pm_auth');
        const authData = JSON.parse(authStore);
        expect(authData).to.have.property('rememberMe', true);
      });
    });

    it('should auto-fill email when remembered', () => {
      // Set remembered email in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('pm_remembered_email', 'test@pawfectmatch.com');
      });

      cy.visit('/login');
      cy.get('input[name="email"]').should('have.value', 'test@pawfectmatch.com');
    });
  });

  describe('Two-Factor Authentication', () => {
    it('should prompt for 2FA code', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { requires2FA: true, tempToken: 'temp-token' },
      }).as('login2FA');

      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@login2FA');
      cy.get('[data-testid="2fa-modal"]').should('be.visible');
      cy.get('input[name="code"]').should('be.visible');
    });

    it('should verify 2FA code successfully', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { requires2FA: true, tempToken: 'temp-token' },
      }).as('login2FA');

      cy.intercept('POST', '**/auth/verify-2fa', { fixture: 'login-success.json' }).as('verify2FA');

      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@login2FA');
      cy.get('input[name="code"]').type('123456');
      cy.get('[data-testid="verify-2fa"]').click();

      cy.wait('@verify2FA');
      cy.url().should('include', '/swipe');
    });

    it('should handle invalid 2FA code', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: { requires2FA: true, tempToken: 'temp-token' },
      }).as('login2FA');

      cy.intercept('POST', '**/auth/verify-2fa', {
        statusCode: 400,
        body: { message: 'Invalid verification code' },
      }).as('invalid2FA');

      cy.get('input[name="email"]').type('test@pawfectmatch.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@login2FA');
      cy.get('input[name="code"]').type('000000');
      cy.get('[data-testid="verify-2fa"]').click();

      cy.wait('@invalid2FA');
      cy.contains('Invalid verification code').should('be.visible');
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
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="password"]').tab();
      cy.get('button[type="submit"]').should('be.focused');
    });

    it('should have proper ARIA labels', () => {
      cy.get('input[name="email"]').should('have.attr', 'aria-label');
      cy.get('input[name="password"]').should('have.attr', 'aria-label');
      cy.get('button[type="submit"]').should('have.attr', 'aria-label');
    });
  });

  describe('Performance', () => {
    it('should load login page quickly', () => {
      cy.measurePageLoad('/login');
    });

    it('should handle form submission efficiently', () => {
      const startTime = Date.now();

      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('TestPassword123!');
      cy.get('button[type="submit"]').click();

      cy.then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        expect(duration).to.be.lessThan(1000);
      });
    });
  });
});
