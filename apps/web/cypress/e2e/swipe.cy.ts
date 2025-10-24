/**
 * E2E tests for swipe functionality
 * Updated for Next.js App Router
 */

describe('Swipe Feature', () => {
  beforeEach(() => {
    // Login before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@pawfectmatch.com');
    cy.get('input[name="password"]').type('TestPassword123!');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/swipe');
  });

  it('should display pet cards', () => {
    cy.get('[data-testid="swipe-stack"]').should('be.visible');
    cy.get('[data-testid="pet-card"]').should('have.length.at.least', 1);
  });

  it('should show pet information', () => {
    cy.get('[data-testid="pet-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="pet-name"]').should('be.visible');
        cy.get('[data-testid="pet-age"]').should('be.visible');
        cy.get('[data-testid="pet-breed"]').should('be.visible');
      });
  });

  it('should swipe right (like) on a pet', () => {
    cy.get('[data-testid="like-button"]').click();

    // Should show next pet or end message
    cy.wait(500);
    cy.get('[data-testid="swipe-stack"]').should('be.visible');
  });

  it('should swipe left (pass) on a pet', () => {
    cy.get('[data-testid="pass-button"]').click();

    // Should show next pet
    cy.wait(500);
    cy.get('[data-testid="swipe-stack"]').should('be.visible');
  });

  it('should super like a pet', () => {
    cy.get('[data-testid="superlike-button"]').click();

    // Should show next pet
    cy.wait(500);
    cy.get('[data-testid="swipe-stack"]').should('be.visible');
  });

  it('should show match modal on match', () => {
    // This assumes the test user has a potential match
    cy.intercept('POST', '**/swipe', {
      statusCode: 200,
      body: {
        isMatch: true,
        matchId: 'test-match-id',
      },
    });

    cy.get('[data-testid="like-button"]').click();

    // Should show match modal
    cy.get('[data-testid="match-modal"]').should('be.visible');
    cy.contains("It's a Match!").should('be.visible');
  });

  it('should handle rate limiting gracefully', () => {
    // Rapidly click like button
    for (let i = 0; i < 15; i++) {
      cy.get('[data-testid="like-button"]').click({ force: true });
      cy.wait(100);
    }

    // Should show rate limit message
    cy.contains('slow down', { matchCase: false }).should('be.visible');
  });

  it('should show skeleton loader while loading', () => {
    cy.intercept('GET', '**/pets/swipeable', {
      delay: 2000,
      statusCode: 200,
      body: [],
    });

    cy.visit('/swipe');
    cy.get('[role="status"]').should('be.visible');
  });

  it('should show empty state when no pets available', () => {
    cy.intercept('GET', '**/pets/swipeable', {
      statusCode: 200,
      body: { pets: [] },
    });

    cy.visit('/swipe');
    cy.contains('No pets to discover').should('be.visible');
  });
});
