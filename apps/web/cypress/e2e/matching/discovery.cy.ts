/**
 * E2E Tests for Pet Discovery
 * Comprehensive testing of the discovery features
 */

describe('Pet Discovery', () => {
  beforeEach(() => {
    cy.clearAllStorage();
    cy.clearCookies();
    cy.loginAsTestUser();
    cy.visit('/discovery');
  });

  describe('Discovery Interface', () => {
    it('should display discovery grid with pet cards', () => {
      cy.get('[data-testid="discovery-grid"]').should('be.visible');
      cy.get('[data-testid="pet-card"]').should('have.length.at.least', 1);
    });

    it('should show pet information on cards', () => {
      cy.get('[data-testid="pet-card"]')
        .first()
        .within(() => {
          cy.get('[data-testid="pet-name"]').should('be.visible');
          cy.get('[data-testid="pet-age"]').should('be.visible');
          cy.get('[data-testid="pet-breed"]').should('be.visible');
          cy.get('[data-testid="pet-photo"]').should('be.visible');
          cy.get('[data-testid="pet-location"]').should('be.visible');
        });
    });

    it('should display filter options', () => {
      cy.get('[data-testid="filter-button"]').should('be.visible');
      cy.get('[data-testid="filter-button"]').click();

      cy.get('[data-testid="filter-modal"]').should('be.visible');
      cy.get('[data-testid="species-filter"]').should('be.visible');
      cy.get('[data-testid="age-filter"]').should('be.visible');
      cy.get('[data-testid="size-filter"]').should('be.visible');
      cy.get('[data-testid="gender-filter"]').should('be.visible');
      cy.get('[data-testid="distance-filter"]').should('be.visible');
    });

    it('should display search functionality', () => {
      cy.get('[data-testid="search-input"]').should('be.visible');
      cy.get('[data-testid="search-button"]').should('be.visible');
    });

    it('should show sort options', () => {
      cy.get('[data-testid="sort-select"]').should('be.visible');
      cy.get('[data-testid="sort-select"]').click();

      cy.get('[data-testid="sort-option-distance"]').should('be.visible');
      cy.get('[data-testid="sort-option-age"]').should('be.visible');
      cy.get('[data-testid="sort-option-recent"]').should('be.visible');
    });
  });

  describe('Filtering', () => {
    it('should filter pets by species', () => {
      cy.intercept('GET', '**/pets/discovery?species=dog', {
        statusCode: 200,
        body: { pets: [{ id: 'pet-1', name: 'Buddy', species: 'dog' }] },
      }).as('filterDogs');

      cy.get('[data-testid="filter-button"]').click();
      cy.get('[data-testid="species-filter"]').select('dog');
      cy.get('[data-testid="apply-filters"]').click();

      cy.wait('@filterDogs');
      cy.get('[data-testid="pet-card"]').should('have.length', 1);
      cy.get('[data-testid="pet-card"]').first().should('contain', 'Buddy');
    });

    it('should filter pets by age range', () => {
      cy.intercept('GET', '**/pets/discovery?ageMin=1&ageMax=3', {
        statusCode: 200,
        body: { pets: [{ id: 'pet-1', name: 'Buddy', age: 2 }] },
      }).as('filterAge');

      cy.get('[data-testid="filter-button"]').click();
      cy.get('[data-testid="age-min-input"]').type('1');
      cy.get('[data-testid="age-max-input"]').type('3');
      cy.get('[data-testid="apply-filters"]').click();

      cy.wait('@filterAge');
      cy.get('[data-testid="pet-card"]').should('have.length', 1);
    });

    it('should filter pets by size', () => {
      cy.intercept('GET', '**/pets/discovery?size=large', {
        statusCode: 200,
        body: { pets: [{ id: 'pet-1', name: 'Buddy', size: 'large' }] },
      }).as('filterSize');

      cy.get('[data-testid="filter-button"]').click();
      cy.get('[data-testid="size-filter"]').select('large');
      cy.get('[data-testid="apply-filters"]').click();

      cy.wait('@filterSize');
      cy.get('[data-testid="pet-card"]').should('have.length', 1);
    });

    it('should filter pets by distance', () => {
      cy.intercept('GET', '**/pets/discovery?distance=10', {
        statusCode: 200,
        body: { pets: [{ id: 'pet-1', name: 'Buddy' }] },
      }).as('filterDistance');

      cy.get('[data-testid="filter-button"]').click();
      cy.get('[data-testid="distance-slider"]').invoke('val', 10).trigger('change');
      cy.get('[data-testid="apply-filters"]').click();

      cy.wait('@filterDistance');
      cy.get('[data-testid="pet-card"]').should('have.length', 1);
    });

    it('should clear all filters', () => {
      cy.get('[data-testid="filter-button"]').click();
      cy.get('[data-testid="species-filter"]').select('dog');
      cy.get('[data-testid="size-filter"]').select('large');
      cy.get('[data-testid="clear-filters"]').click();

      cy.get('[data-testid="species-filter"]').should('have.value', '');
      cy.get('[data-testid="size-filter"]').should('have.value', '');
    });

    it('should show active filter count', () => {
      cy.get('[data-testid="filter-button"]').click();
      cy.get('[data-testid="species-filter"]').select('dog');
      cy.get('[data-testid="size-filter"]').select('large');
      cy.get('[data-testid="apply-filters"]').click();

      cy.get('[data-testid="active-filters-count"]').should('contain', '2');
    });
  });

  describe('Search', () => {
    it('should search pets by name', () => {
      cy.intercept('GET', '**/pets/discovery?search=Buddy', {
        statusCode: 200,
        body: { pets: [{ id: 'pet-1', name: 'Buddy' }] },
      }).as('searchPets');

      cy.get('[data-testid="search-input"]').type('Buddy');
      cy.get('[data-testid="search-button"]').click();

      cy.wait('@searchPets');
      cy.get('[data-testid="pet-card"]').should('have.length', 1);
      cy.get('[data-testid="pet-card"]').first().should('contain', 'Buddy');
    });

    it('should search pets by breed', () => {
      cy.intercept('GET', '**/pets/discovery?search=Golden Retriever', {
        statusCode: 200,
        body: { pets: [{ id: 'pet-1', name: 'Buddy', breed: 'Golden Retriever' }] },
      }).as('searchBreed');

      cy.get('[data-testid="search-input"]').type('Golden Retriever');
      cy.get('[data-testid="search-button"]').click();

      cy.wait('@searchBreed');
      cy.get('[data-testid="pet-card"]').should('have.length', 1);
    });

    it('should show search suggestions', () => {
      cy.intercept('GET', '**/pets/search-suggestions?q=Bud', {
        statusCode: 200,
        body: { suggestions: ['Buddy', 'Buddy the Dog'] },
      }).as('searchSuggestions');

      cy.get('[data-testid="search-input"]').type('Bud');

      cy.wait('@searchSuggestions');
      cy.get('[data-testid="search-suggestions"]').should('be.visible');
      cy.get('[data-testid="search-suggestion"]').should('have.length.at.least', 1);
    });

    it('should clear search results', () => {
      cy.get('[data-testid="search-input"]').type('Buddy');
      cy.get('[data-testid="search-button"]').click();

      cy.get('[data-testid="clear-search"]').click();
      cy.get('[data-testid="search-input"]').should('have.value', '');
      cy.get('[data-testid="pet-card"]').should('have.length.at.least', 1);
    });
  });

  describe('Sorting', () => {
    it('should sort pets by distance', () => {
      cy.intercept('GET', '**/pets/discovery?sort=distance', {
        statusCode: 200,
        body: {
          pets: [
            { id: 'pet-1', name: 'Buddy', distance: 0.5 },
            { id: 'pet-2', name: 'Luna', distance: 1.2 },
          ],
        },
      }).as('sortDistance');

      cy.get('[data-testid="sort-select"]').select('distance');

      cy.wait('@sortDistance');
      cy.get('[data-testid="pet-card"]').first().should('contain', 'Buddy');
    });

    it('should sort pets by age', () => {
      cy.intercept('GET', '**/pets/discovery?sort=age', {
        statusCode: 200,
        body: {
          pets: [
            { id: 'pet-1', name: 'Buddy', age: 1 },
            { id: 'pet-2', name: 'Luna', age: 3 },
          ],
        },
      }).as('sortAge');

      cy.get('[data-testid="sort-select"]').select('age');

      cy.wait('@sortAge');
      cy.get('[data-testid="pet-card"]').first().should('contain', 'Buddy');
    });

    it('should sort pets by most recent', () => {
      cy.intercept('GET', '**/pets/discovery?sort=recent', {
        statusCode: 200,
        body: {
          pets: [
            { id: 'pet-1', name: 'Buddy', createdAt: '2024-01-15T10:00:00Z' },
            { id: 'pet-2', name: 'Luna', createdAt: '2024-01-14T10:00:00Z' },
          ],
        },
      }).as('sortRecent');

      cy.get('[data-testid="sort-select"]').select('recent');

      cy.wait('@sortRecent');
      cy.get('[data-testid="pet-card"]').first().should('contain', 'Buddy');
    });
  });

  describe('Pagination', () => {
    it('should load more pets on scroll', () => {
      cy.intercept('GET', '**/pets/discovery?page=2', {
        statusCode: 200,
        body: { pets: [{ id: 'pet-3', name: 'Max' }] },
      }).as('loadMore');

      cy.scrollTo('bottom');

      cy.wait('@loadMore');
      cy.get('[data-testid="pet-card"]').should('have.length.at.least', 2);
    });

    it('should show loading indicator during pagination', () => {
      cy.intercept('GET', '**/pets/discovery?page=2', {
        delay: 1000,
        statusCode: 200,
        body: { pets: [] },
      }).as('slowLoadMore');

      cy.scrollTo('bottom');
      cy.get('[data-testid="pagination-loading"]').should('be.visible');

      cy.wait('@slowLoadMore');
      cy.get('[data-testid="pagination-loading"]').should('not.exist');
    });

    it('should handle end of results', () => {
      cy.intercept('GET', '**/pets/discovery?page=2', {
        statusCode: 200,
        body: { pets: [], hasMore: false },
      }).as('endOfResults');

      cy.scrollTo('bottom');

      cy.wait('@endOfResults');
      cy.get('[data-testid="end-of-results"]').should('be.visible');
      cy.contains('No more pets to discover').should('be.visible');
    });
  });

  describe('Pet Details', () => {
    it('should show pet details on card click', () => {
      cy.get('[data-testid="pet-card"]').first().click();
      cy.get('[data-testid="pet-details-modal"]').should('be.visible');
      cy.get('[data-testid="pet-photos"]').should('be.visible');
      cy.get('[data-testid="pet-bio"]').should('be.visible');
      cy.get('[data-testid="pet-temperament"]').should('be.visible');
    });

    it('should show owner information', () => {
      cy.get('[data-testid="pet-card"]').first().click();
      cy.get('[data-testid="pet-details-modal"]').should('be.visible');
      cy.get('[data-testid="owner-info"]').should('be.visible');
      cy.get('[data-testid="owner-name"]').should('be.visible');
    });

    it('should allow swiping from details modal', () => {
      cy.intercept('POST', '**/pets/*/swipe', { statusCode: 200 }).as('swipeFromDetails');

      cy.get('[data-testid="pet-card"]').first().click();
      cy.get('[data-testid="pet-details-modal"]').should('be.visible');

      cy.get('[data-testid="like-button"]').click();

      cy.wait('@swipeFromDetails');
      cy.get('[data-testid="pet-details-modal"]').should('not.exist');
    });

    it('should show pet location on map', () => {
      cy.get('[data-testid="pet-card"]').first().click();
      cy.get('[data-testid="pet-details-modal"]').should('be.visible');
      cy.get('[data-testid="location-tab"]').click();
      cy.get('[data-testid="pet-map"]').should('be.visible');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no pets match filters', () => {
      cy.intercept('GET', '**/pets/discovery?species=cat', {
        statusCode: 200,
        body: { pets: [] },
      }).as('emptyFilter');

      cy.get('[data-testid="filter-button"]').click();
      cy.get('[data-testid="species-filter"]').select('cat');
      cy.get('[data-testid="apply-filters"]').click();

      cy.wait('@emptyFilter');
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.contains('No pets found matching your criteria').should('be.visible');
    });

    it('should show empty state when search returns no results', () => {
      cy.intercept('GET', '**/pets/discovery?search=nonexistent', {
        statusCode: 200,
        body: { pets: [] },
      }).as('emptySearch');

      cy.get('[data-testid="search-input"]').type('nonexistent');
      cy.get('[data-testid="search-button"]').click();

      cy.wait('@emptySearch');
      cy.get('[data-testid="empty-state"]').should('be.visible');
      cy.contains('No pets found for "nonexistent"').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle API error gracefully', () => {
      cy.intercept('GET', '**/pets/discovery', {
        statusCode: 500,
        body: { message: 'Internal server error' },
      }).as('apiError');

      cy.visit('/discovery');

      cy.wait('@apiError');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.contains('Something went wrong').should('be.visible');
    });

    it('should retry failed requests', () => {
      cy.intercept('GET', '**/pets/discovery', {
        statusCode: 500,
        body: { message: 'Internal server error' },
      }).as('apiError');

      cy.intercept('GET', '**/pets/discovery', {
        statusCode: 200,
        body: { pets: [{ id: 'pet-1', name: 'Buddy' }] },
      }).as('apiRetry');

      cy.visit('/discovery');

      cy.wait('@apiError');
      cy.get('[data-testid="retry-button"]').click();

      cy.wait('@apiRetry');
      cy.get('[data-testid="pet-card"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen readers', () => {
      cy.checkPageA11y();
    });

    it('should support keyboard navigation', () => {
      cy.get('[data-testid="pet-card"]').first().focus();
      cy.get('[data-testid="pet-card"]').first().pressKey('Enter');
      cy.get('[data-testid="pet-details-modal"]').should('be.visible');
    });

    it('should have proper ARIA labels', () => {
      cy.get('[data-testid="pet-card"]').first().should('have.attr', 'aria-label');
      cy.get('[data-testid="search-input"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="filter-button"]').should('have.attr', 'aria-label');
    });
  });

  describe('Performance', () => {
    it('should load discovery page quickly', () => {
      cy.measurePageLoad('/discovery');
    });

    it('should handle large number of pets efficiently', () => {
      cy.intercept('GET', '**/pets/discovery', {
        statusCode: 200,
        body: {
          pets: Array.from({ length: 100 }, (_, i) => ({ id: `pet-${i}`, name: `Pet ${i}` })),
        },
      }).as('manyPets');

      cy.visit('/discovery');

      cy.wait('@manyPets');
      cy.get('[data-testid="pet-card"]').should('have.length.at.least', 10);
    });
  });
});
