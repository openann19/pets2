// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

import '@testing-library/cypress/add-commands';

// Custom commands for API authentication
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password },
  }).then((response) => {
    expect(response.status).to.eq(200);
    const { accessToken, user } = response.body.data;
    
    // Store in localStorage as the app does
    window.localStorage.setItem('token', accessToken);
    window.localStorage.setItem('user', JSON.stringify(user));
    
    return { token: accessToken, user };
  });
});

Cypress.Commands.add('register', (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: userData,
  }).then((response) => {
    expect(response.status).to.eq(201);
    return response.body.data;
  });
});

Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
});

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<{ token: string; user: Record<string, unknown> }>;
      register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
      }): Chainable<any>;
      logout(): Chainable<void>;
    }
  }
}

export {};

