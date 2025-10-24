/**
 * E2E Test: Chat and Messaging
 * 
 * Tests messaging between matched users.
 * Focus: Message sending, receiving, data persistence (NOT styling)
 */

describe('Chat and Messaging', () => {
  const user1Email = `chatter1${Date.now()}@example.com`;
  const user2Email = `chatter2${Date.now()}@example.com`;
  const testPassword = 'TestPass123!@#';
  let user1Token: string;
  let user2Token: string;
  let matchId: string;

  before(() => {
    // Create two users, create pets, and create a match
    cy.register({
      email: user1Email,
      password: testPassword,
      firstName: 'Chatter',
      lastName: 'One',
      dateOfBirth: '1990-01-01',
    }).then((data) => {
      user1Token = data.accessToken;

      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/pets`,
        headers: { Authorization: `Bearer ${user1Token}` },
        body: {
          name: 'Chatter1 Pet',
          species: 'cat',
          breed: 'Siamese',
          age: 2,
          gender: 'female',
          size: 'small',
          intent: 'adoption',
        },
      }).then((pet1Response) => {
        const pet1Id = pet1Response.body.data.pet._id;

        cy.register({
          email: user2Email,
          password: testPassword,
          firstName: 'Chatter',
          lastName: 'Two',
          dateOfBirth: '1990-01-01',
        }).then((user2Data) => {
          user2Token = user2Data.accessToken;

          cy.request({
            method: 'POST',
            url: `${Cypress.env('apiUrl')}/pets`,
            headers: { Authorization: `Bearer ${user2Token}` },
            body: {
              name: 'Chatter2 Pet',
              species: 'cat',
              breed: 'Persian',
              age: 3,
              gender: 'male',
              size: 'medium',
              intent: 'adoption',
            },
          }).then((pet2Response) => {
            const pet2Id = pet2Response.body.data.pet._id;

            // Create mutual likes to form a match
            cy.request({
              method: 'POST',
              url: `${Cypress.env('apiUrl')}/pets/${pet2Id}/swipe`,
              headers: { Authorization: `Bearer ${user1Token}` },
              body: { petId: pet1Id, action: 'like' },
            });

            cy.request({
              method: 'POST',
              url: `${Cypress.env('apiUrl')}/pets/${pet1Id}/swipe`,
              headers: { Authorization: `Bearer ${user2Token}` },
              body: { petId: pet2Id, action: 'like' },
            }).then((swipeResponse) => {
              matchId = swipeResponse.body.data.match?._id;
            });
          });
        });
      });
    });
  });

  describe('Message Sending', () => {
    beforeEach(() => {
      cy.login(user1Email, testPassword);
    });

    it('should send a message to a match', () => {
      cy.visit(`/chat/${matchId}`);

      cy.intercept('POST', `**/api/matches/${matchId}/messages`).as('sendMessage');

      // Type and send message
      cy.get('textarea[name="message"]').type('Hello! How are you?');
      cy.contains('button', /send/i).click();

      cy.wait('@sendMessage').then((interception) => {
        expect(interception.request.body).to.have.property('message', 'Hello! How are you?');
        expect(interception.response?.statusCode).to.eq(201);
        const response = interception.response?.body;
        expect(response).to.have.property('success', true);
        expect(response.data).to.have.property('message');
        expect(response.data.message).to.have.property('content', 'Hello! How are you?');
      });

      // Verify message is displayed
      cy.contains('Hello! How are you?').should('be.visible');
    });

    it('should not send empty message', () => {
      cy.visit(`/chat/${matchId}`);

      // Try to send without typing
      cy.contains('button', /send/i).click();

      // Verify no API call was made or validation error shown
      cy.get('@sendMessage').should('not.exist');
    });
  });

  describe('Message History', () => {
    beforeEach(() => {
      // Send a message first
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/matches/${matchId}/messages`,
        headers: { Authorization: `Bearer ${user1Token}` },
        body: { message: 'Test message for history' },
      });

      cy.login(user1Email, testPassword);
    });

    it('should load message history', () => {
      cy.visit(`/chat/${matchId}`);

      cy.intercept('GET', `**/api/matches/${matchId}/messages*`).as('getMessages');

      cy.wait('@getMessages').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        const response = interception.response?.body;
        expect(response).to.have.property('success', true);
        expect(response.data).to.have.property('messages');
        expect(response.data.messages).to.be.an('array');
      });

      // Verify messages are displayed
      cy.contains('Test message for history').should('be.visible');
    });

    it('should display messages in chronological order', () => {
      // Send multiple messages
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/matches/${matchId}/messages`,
        headers: { Authorization: `Bearer ${user1Token}` },
        body: { message: 'First message' },
      });

      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/matches/${matchId}/messages`,
        headers: { Authorization: `Bearer ${user1Token}` },
        body: { message: 'Second message' },
      });

      cy.visit(`/chat/${matchId}`);

      // Verify order
      cy.get('[data-testid="message"]').first().should('contain', 'First');
      cy.get('[data-testid="message"]').last().should('contain', 'Second');
    });
  });

  describe('Message Read Status', () => {
    beforeEach(() => {
      cy.login(user1Email, testPassword);
    });

    it('should mark messages as read', () => {
      // Send message as user 2
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/matches/${matchId}/messages`,
        headers: { Authorization: `Bearer ${user2Token}` },
        body: { message: 'Unread message' },
      });

      cy.visit(`/chat/${matchId}`);

      cy.intercept('PATCH', `**/api/matches/${matchId}/messages/read`).as('markAsRead');

      // Wait for mark as read request
      cy.wait('@markAsRead', { timeout: 10000 }).then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
      });
    });
  });

  describe('Online Status', () => {
    beforeEach(() => {
      cy.login(user1Email, testPassword);
    });

    it('should get online users', () => {
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/chat/online`,
        headers: { Authorization: `Bearer ${user1Token}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        const data = response.body;
        expect(data).to.have.property('success', true);
      });
    });
  });

  describe('Match Actions', () => {
    beforeEach(() => {
      cy.login(user1Email, testPassword);
    });

    it('should archive a match', () => {
      cy.visit('/matches');

      cy.intercept('PATCH', `**/api/matches/${matchId}/archive`).as('archiveMatch');

      // Find and click archive button
      cy.get(`[data-match-id="${matchId}"]`).within(() => {
        cy.contains('button', /archive/i).click();
      });

      cy.wait('@archiveMatch').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);
      });
    });

    it('should favorite a match', () => {
      cy.request({
        method: 'PATCH',
        url: `${Cypress.env('apiUrl')}/matches/${matchId}/favorite`,
        headers: { Authorization: `Bearer ${user1Token}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        const data = response.body;
        expect(data).to.have.property('success', true);
      });
    });

    it('should block a match', () => {
      cy.request({
        method: 'PATCH',
        url: `${Cypress.env('apiUrl')}/matches/${matchId}/block`,
        headers: { Authorization: `Bearer ${user1Token}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        const data = response.body;
        expect(data).to.have.property('success', true);
      });
    });
  });
});

