/**
 * E2E tests for pet matching functionality
 * Covers swipe mechanics, match creation, and recommendation algorithms
 */

describe('Pet Matching', () => {
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

  describe('Swipe Interface', () => {
    it('should display pet profiles for swiping', () => {
      cy.visit('/swipe');

      // Should show pet card
      cy.get('[data-testid="swipe-card"]').should('be.visible');

      // Should display pet information
      cy.get('[data-testid="pet-name"]').should('be.visible');
      cy.get('[data-testid="pet-age"]').should('be.visible');
      cy.get('[data-testid="pet-breed"]').should('be.visible');
    });

    it('should like a pet profile', () => {
      cy.visit('/swipe');

      // Click like button
      cy.get('[data-testid="like-button"]').click();

      // Should load next pet
      cy.get('[data-testid="swipe-card"]').should('be.visible');
    });

    it('should pass on a pet profile', () => {
      cy.visit('/swipe');

      // Click pass button
      cy.get('[data-testid="pass-button"]').click();

      // Should load next pet
      cy.get('[data-testid="swipe-card"]').should('be.visible');
    });

    it('should super like a pet profile', () => {
      cy.visit('/swipe');

      // Click super like button
      cy.get('[data-testid="super-like-button"]').click();

      // Should show super like confirmation
      cy.contains('Super Like sent!').should('be.visible');
    });
  });

  describe('Match Creation', () => {
    it('should create a match when two pets like each other', () => {
      cy.visit('/swipe');

      // Like a pet
      cy.get('[data-testid="like-button"]').click();

      // Simulate match creation
      cy.visit('/matches');

      // Should show new match
      cy.get('[data-testid="match-item"]').should('have.length.greaterThan', 0);
    });

    it('should display match notifications', () => {
      cy.visit('/swipe');

      // Like a pet that also likes back
      cy.get('[data-testid="like-button"]').click();

      // Should show match notification
      cy.get('[data-testid="match-notification"]').should('be.visible');
    });
  });

  describe('Match Management', () => {
    it('should unmatch with a pet', () => {
      cy.visit('/matches');

      // Find a match and click unmatch
      cy.get('[data-testid="unmatch-button"]').first().click();

      // Confirm unmatch
      cy.contains('Yes, unmatch').click();

      // Should show confirmation
      cy.contains('Unmatched successfully').should('be.visible');
    });

    it('should block a user', () => {
      cy.visit('/matches');

      // Find a match and click block
      cy.get('[data-testid="block-button"]').first().click();

      // Confirm block
      cy.contains('Yes, block').click();

      // Should show confirmation
      cy.contains('User blocked').should('be.visible');
    });

    it('should archive a match', () => {
      cy.visit('/matches');

      // Find a match and click archive
      cy.get('[data-testid="archive-button"]').first().click();

      // Should be removed from active matches
      cy.get('[data-testid="match-item"]').should('have.length.lessThan', 3);
    });
  });

  describe('Advanced Filters', () => {
    it('should apply species filters', () => {
      cy.visit('/swipe');

      // Open filters
      cy.get('[data-testid="filter-button"]').click();

      // Apply species filter
      cy.get('[data-testid="species-filter"]').select('dog');

      // Apply filters
      cy.contains('Apply Filters').click();

      // All displayed pets should be dogs
      cy.get('[data-testid="pet-species"]').each(($el) => {
        cy.wrap($el).should('contain.text', 'dog');
      });
    });

    it('should apply age range filters', () => {
      cy.visit('/swipe');

      // Open filters
      cy.get('[data-testid="filter-button"]').click();

      // Apply age range filter
      cy.get('[data-testid="min-age-input"]').type('1');
      cy.get('[data-testid="max-age-input"]').type('5');

      // Apply filters
      cy.contains('Apply Filters').click();

      // All displayed pets should be within age range
      cy.get('[data-testid="pet-age"]').each(($el) => {
        const age = parseInt($el.text());
        expect(age).to.be.at.least(1);
        expect(age).to.be.at.most(5);
      });
    });

    it('should apply intent filters', () => {
      cy.visit('/swipe');

      // Open filters
      cy.get('[data-testid="filter-button"]').click();

      // Apply intent filter
      cy.get('[data-testid="intent-filter"]').select('playdate');

      // Apply filters
      cy.contains('Apply Filters').click();

      // Should show filtered results
      cy.get('[data-testid="swipe-card"]').should('be.visible');
    });

    it('should reset filters', () => {
      cy.visit('/swipe');

      // Open filters
      cy.get('[data-testid="filter-button"]').click();

      // Apply some filters
      cy.get('[data-testid="species-filter"]').select('cat');

      // Reset filters
      cy.contains('Reset Filters').click();

      // Should show all pets again
      cy.get('[data-testid="swipe-card"]').should('be.visible');
    });
  });

  describe('Search & Discovery', () => {
    it('should search for pets by name', () => {
      cy.visit('/discover');

      // Enter search term
      cy.get('[data-testid="search-input"]').type('Buddy');

      // Submit search
      cy.get('[data-testid="search-button"]').click();

      // Should show search results
      cy.contains('Buddy').should('be.visible');
    });

    it('should search by location', () => {
      cy.visit('/discover');

      // Enter location
      cy.get('[data-testid="location-input"]').type('New York');

      // Submit search
      cy.get('[data-testid="search-button"]').click();

      // Should show location-based results
      cy.get('[data-testid="pet-location"]').should('contain.text', 'New York');
    });

    it('should save search preferences', () => {
      cy.visit('/discover');

      // Apply filters
      cy.get('[data-testid="filter-button"]').click();
      cy.get('[data-testid="species-filter"]').select('dog');
      cy.contains('Apply Filters').click();

      // Save preferences
      cy.contains('Save Preferences').click();

      // Should show confirmation
      cy.contains('Search preferences saved').should('be.visible');
    });
  });

  describe('AI Recommendations', () => {
    it('should display AI-powered recommendations', () => {
      cy.visit('/discover');

      // Should show recommended pets section
      cy.contains('Recommended for You').should('be.visible');

      // Should display recommendation scores
      cy.get('[data-testid="compatibility-score"]').should('be.visible');
    });

    it('should sort by compatibility score', () => {
      cy.visit('/discover');

      // Sort by compatibility
      cy.get('[data-testid="sort-select"]').select('compatibility');

      // Should show sorted results
      cy.get('[data-testid="compatibility-score"]').first().should('contain.text', '95%'); // Highest score first
    });
  });

  describe('Error Handling', () => {
    it('should handle swipe API errors gracefully', () => {
      cy.visit('/swipe');

      // Simulate API error
      cy.intercept('POST', '/api/swipe', { statusCode: 500 });

      // Try to swipe
      cy.get('[data-testid="like-button"]').click();

      // Should show error message
      cy.contains('Failed to process swipe').should('be.visible');
    });

    it('should handle match API errors', () => {
      cy.visit('/matches');

      // Simulate API error
      cy.intercept('GET', '/api/matches', { statusCode: 500 });

      // Should show error message
      cy.contains('Failed to load matches').should('be.visible');
    });
  });
});
