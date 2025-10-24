/**
 * E2E Test: Swipe and Match Flow
 * 
 * Tests pet discovery, swiping, and match creation.
 * Focus: API interactions, match logic, data flow (NOT styling)
 */

describe('Swipe and Match Flow', () => {
  const user1Email = `swiper1${Date.now()}@example.com`;
  const user2Email = `swiper2${Date.now()}@example.com`;
  const testPassword = 'TestPass123!@#';
  let user1Token: string;
  let user2Token: string;
  let user1PetId: string;
  let user2PetId: string;

  before(() => {
    // Create two users with pets
    cy.register({
      email: user1Email,
      password: testPassword,
      firstName: 'User',
      lastName: 'One',
      dateOfBirth: '1990-01-01',
    }).then((data) => {
      user1Token = data.accessToken;

      // Create pet for user 1
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/pets`,
        headers: { Authorization: `Bearer ${user1Token}` },
        body: {
          name: 'User1 Pet',
          species: 'dog',
          breed: 'Beagle',
          age: 3,
          gender: 'male',
          size: 'medium',
          intent: 'playdate',
        },
      }).then((response) => {
        user1PetId = response.body.data.pet._id;
      });
    });

    cy.register({
      email: user2Email,
      password: testPassword,
      firstName: 'User',
      lastName: 'Two',
      dateOfBirth: '1990-01-01',
    }).then((data) => {
      user2Token = data.accessToken;

      // Create pet for user 2
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/pets`,
        headers: { Authorization: `Bearer ${user2Token}` },
        body: {
          name: 'User2 Pet',
          species: 'dog',
          breed: 'Poodle',
          age: 2,
          gender: 'female',
          size: 'small',
          intent: 'playdate',
        },
      }).then((response) => {
        user2PetId = response.body.data.pet._id;
      });
    });
  });

  describe('Pet Discovery', () => {
    beforeEach(() => {
      cy.login(user1Email, testPassword);
    });

    it('should load discoverable pets', () => {
      cy.visit('/swipe');

      cy.intercept('GET', '**/api/pets/discover*').as('discoverPets');

      cy.wait('@discoverPets').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        const response = interception.response?.body;
        expect(response).to.have.property('success', true);
        expect(response.data).to.have.property('pets');
        expect(response.data.pets).to.be.an('array');
      });

      // Verify pets are displayed
      cy.get('[data-testid="pet-card"]').should('exist');
    });

    it('should filter pets by species', () => {
      cy.visit('/swipe');

      cy.intercept('GET', '**/api/pets/discover?species=cat').as('discoverCats');

      // Select cat filter if available
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="species-filter"]').length > 0) {
          cy.get('[data-testid="species-filter"]').select('cat');

          cy.wait('@discoverCats').then((interception) => {
            expect(interception.response?.statusCode).to.eq(200);
          });
        }
      });
    });
  });

  describe('Swipe Actions', () => {
    beforeEach(() => {
      cy.login(user1Email, testPassword);
    });

    it('should record a like swipe', () => {
      cy.visit('/swipe');

      cy.intercept('POST', '**/api/pets/*/swipe').as('swipePet');

      // Wait for pets to load
      cy.get('[data-testid="pet-card"]', { timeout: 10000 }).should('exist');

      // Click like button
      cy.get('[data-testid="like-button"]').first().click();

      cy.wait('@swipePet').then((interception) => {
        expect(interception.request.body).to.have.property('action', 'like');
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
        const response = interception.response?.body;
        expect(response).to.have.property('success', true);
      });
    });

    it('should record a pass swipe', () => {
      cy.visit('/swipe');

      cy.intercept('POST', '**/api/pets/*/swipe').as('swipePet');

      cy.get('[data-testid="pet-card"]', { timeout: 10000 }).should('exist');

      // Click pass button
      cy.get('[data-testid="pass-button"]').first().click();

      cy.wait('@swipePet').then((interception) => {
        expect(interception.request.body).to.have.property('action', 'pass');
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });
    });
  });

  describe('Match Creation', () => {
    it('should create a match when both users like each other', () => {
      // User 1 likes User 2's pet
      cy.login(user1Email, testPassword);
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/pets/${user2PetId}/swipe`,
        headers: { Authorization: `Bearer ${user1Token}` },
        body: {
          petId: user1PetId,
          action: 'like',
        },
      });

      // User 2 likes User 1's pet (should create match)
      cy.login(user2Email, testPassword);
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/pets/${user1PetId}/swipe`,
        headers: { Authorization: `Bearer ${user2Token}` },
        body: {
          petId: user2PetId,
          action: 'like',
        },
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 201]);
        const data = response.body.data;

        // Verify match was created
        if (data.match) {
          expect(data.match).to.have.property('_id');
          expect(data.isMatch).to.eq(true);
        }
      });

      // Verify match appears in matches list
      cy.visit('/matches');

      cy.intercept('GET', '**/api/matches*').as('getMatches');

      cy.wait('@getMatches').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        const response = interception.response?.body;
        expect(response.data.matches).to.be.an('array');
        expect(response.data.matches.length).to.be.greaterThan(0);
      });

      // Verify match is displayed
      cy.contains('User1 Pet').should('be.visible');
    });
  });

  describe('Match List', () => {
    beforeEach(() => {
      cy.login(user1Email, testPassword);
    });

    it('should display all matches', () => {
      cy.visit('/matches');

      cy.intercept('GET', '**/api/matches*').as('getMatches');

      cy.wait('@getMatches').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        const response = interception.response?.body;
        expect(response).to.have.property('success', true);
        expect(response.data).to.have.property('matches');
      });
    });

    it('should view match details', () => {
      cy.visit('/matches');

      // Click on first match
      cy.get('[data-testid="match-card"]').first().click();

      // Verify navigation to match details
      cy.url().should('include', '/matches/');
      cy.url().should('match', /\/matches\/[a-f0-9]{24}/);
    });
  });

  describe('Match Statistics', () => {
    beforeEach(() => {
      cy.login(user1Email, testPassword);
    });

    it('should get match statistics', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/matches/stats`,
        headers: { Authorization: `Bearer ${user1Token}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        const data = response.body.data;
        expect(data).to.have.property('stats');
        expect(data.stats).to.have.property('totalMatches');
        expect(data.stats.totalMatches).to.be.a('number');
      });
    });
  });
});

