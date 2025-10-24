/**
 * E2E Test: Pet Management
 * 
 * Tests pet creation, viewing, editing, and deletion.
 * Focus: API requests, data persistence, UI updates (NOT styling)
 */

describe('Pet Management', () => {
  const testEmail = `petowner${Date.now()}@example.com`;
  const testPassword = 'TestPass123!@#';

  before(() => {
    // Create and login user
    cy.register({
      email: testEmail,
      password: testPassword,
      firstName: 'Pet',
      lastName: 'Owner',
      dateOfBirth: '1990-01-01',
    });
  });

  beforeEach(() => {
    cy.login(testEmail, testPassword);
  });

  describe('Pet Creation', () => {
    it('should create a new pet successfully', () => {
      cy.visit('/pets/new');

      cy.intercept('POST', '**/api/pets').as('createPet');

      // Fill out pet form
      cy.get('input[name="name"]').type('Buddy');
      cy.get('select[name="species"]').select('dog');
      cy.get('input[name="breed"]').type('Golden Retriever');
      cy.get('input[name="age"]').type('3');
      cy.get('select[name="gender"]').select('male');
      cy.get('select[name="size"]').select('large');
      cy.get('select[name="intent"]').select('playdate');
      cy.get('textarea[name="description"]').type('Friendly dog looking for playdates');

      // Submit form
      cy.contains('button', /create|add pet|save/i).click();

      // Verify API request
      cy.wait('@createPet').then((interception) => {
        expect(interception.response?.statusCode).to.eq(201);
        const response = interception.response?.body;
        expect(response).to.have.property('success', true);
        expect(response.data).to.have.property('pet');
        expect(response.data.pet).to.have.property('name', 'Buddy');
        expect(response.data.pet).to.have.property('species', 'dog');
        expect(response.data.pet).to.have.property('breed', 'Golden Retriever');
      });

      // Verify redirect to pet list or details
      cy.url().should('not.include', '/new');
    });

    it('should show validation error for missing required fields', () => {
      cy.visit('/pets/new');

      // Try to submit without filling required fields
      cy.contains('button', /create|add pet|save/i).click();

      // Verify validation errors are displayed
      cy.contains(/required|must provide/i).should('be.visible');
    });

    it('should create pet with valid species only', () => {
      cy.visit('/pets/new');

      cy.intercept('POST', '**/api/pets').as('createPetInvalidSpecies');

      cy.get('input[name="name"]').type('Test Pet');
      cy.get('select[name="species"]').select('dog'); // Valid
      cy.get('input[name="breed"]').type('Test Breed');
      cy.get('input[name="age"]').type('2');
      cy.get('select[name="gender"]').select('male');
      cy.get('select[name="size"]').select('medium');
      cy.get('select[name="intent"]').select('adoption');

      cy.contains('button', /create|add pet|save/i).click();

      cy.wait('@createPetInvalidSpecies').then((interception) => {
        expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
      });
    });
  });

  describe('Pet Listing', () => {
    let petId: string;

    before(() => {
      // Create a pet for listing tests
      cy.login(testEmail, testPassword);
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/pets`,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
        body: {
          name: 'Listable Pet',
          species: 'cat',
          breed: 'Persian',
          age: 2,
          gender: 'female',
          size: 'small',
          intent: 'adoption',
        },
      }).then((response) => {
        petId = response.body.data.pet._id;
      });
    });

    it('should display user\'s pets', () => {
      cy.visit('/pets');

      cy.intercept('GET', '**/api/pets/my-pets').as('getMyPets');

      cy.wait('@getMyPets').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        const response = interception.response?.body;
        expect(response).to.have.property('success', true);
        expect(response.data).to.have.property('pets');
        expect(response.data.pets).to.be.an('array');
      });

      // Verify pet names are displayed
      cy.contains('Listable Pet').should('be.visible');
    });

    it('should view pet details', () => {
      cy.visit(`/pets/${petId}`);

      cy.intercept('GET', `**/api/pets/${petId}`).as('getPetDetails');

      cy.wait('@getPetDetails').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        const response = interception.response?.body;
        expect(response.data.pet).to.have.property('_id', petId);
        expect(response.data.pet).to.have.property('name', 'Listable Pet');
      });

      // Verify pet details are rendered
      cy.contains('Listable Pet').should('be.visible');
      cy.contains('Persian').should('be.visible');
    });
  });

  describe('Pet Editing', () => {
    let petId: string;

    beforeEach(() => {
      // Create a pet for editing
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/pets`,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
        body: {
          name: 'Editable Pet',
          species: 'dog',
          breed: 'Labrador',
          age: 3,
          gender: 'male',
          size: 'large',
          intent: 'playdate',
        },
      }).then((response) => {
        petId = response.body.data.pet._id;
      });
    });

    it('should update pet information', () => {
      cy.visit(`/pets/${petId}/edit`);

      cy.intercept('PUT', `**/api/pets/${petId}`).as('updatePet');

      // Update pet name
      cy.get('input[name="name"]').clear().type('Updated Pet Name');
      cy.get('textarea[name="description"]').type('Updated description');

      cy.contains('button', /save|update/i).click();

      cy.wait('@updatePet').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        const response = interception.response?.body;
        expect(response.data.pet).to.have.property('name', 'Updated Pet Name');
      });

      // Verify updated data is displayed
      cy.contains('Updated Pet Name').should('be.visible');
    });
  });

  describe('Pet Deletion', () => {
    let petId: string;

    beforeEach(() => {
      // Create a pet for deletion
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/pets`,
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
        body: {
          name: 'Deletable Pet',
          species: 'bird',
          breed: 'Parrot',
          age: 1,
          gender: 'male',
          size: 'tiny',
          intent: 'adoption',
        },
      }).then((response) => {
        petId = response.body.data.pet._id;
      });
    });

    it('should delete a pet', () => {
      cy.visit(`/pets/${petId}`);

      cy.intercept('DELETE', `**/api/pets/${petId}`).as('deletePet');

      // Click delete button
      cy.contains('button', /delete|remove/i).click();

      // Confirm deletion if modal appears
      cy.get('body').then(($body) => {
        if ($body.text().includes('confirm')) {
          cy.contains('button', /confirm|yes|delete/i).click();
        }
      });

      cy.wait('@deletePet').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
      });

      // Verify redirect away from deleted pet
      cy.url().should('not.include', petId);
    });
  });
});

