/**
 * E2E tests for profile management functionality
 * Covers user and pet profile creation, updates, and verification
 */

describe('Profile Management', () => {
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

  describe('User Profile', () => {
    it('should display user profile page', () => {
      cy.visit('/profile');

      // Should show profile information
      cy.contains('Test User').should('be.visible');
      cy.get('[data-testid="user-email"]').should('be.visible');
      cy.get('[data-testid="user-location"]').should('be.visible');
    });

    it('should update user profile information', () => {
      cy.visit('/profile');

      // Click edit button
      cy.contains('Edit Profile').click();

      // Update fields
      cy.get('[data-testid="first-name-input"]').clear().type('Updated');
      cy.get('[data-testid="last-name-input"]').clear().type('User');
      cy.get('[data-testid="bio-input"]').type('This is my updated bio');

      // Save changes
      cy.contains('Save Changes').click();

      // Should show updated information
      cy.contains('Updated User').should('be.visible');
      cy.contains('This is my updated bio').should('be.visible');
    });

    it('should update user preferences', () => {
      cy.visit('/profile');

      // Navigate to preferences
      cy.contains('Preferences').click();

      // Update preference values
      cy.get('[data-testid="max-distance-slider"]').invoke('val', 50);
      cy.get('[data-testid="age-range-slider"]').invoke('val', [25, 45]);

      // Save preferences
      cy.contains('Save Preferences').click();

      // Should show confirmation
      cy.contains('Preferences updated').should('be.visible');
    });
  });

  describe('Pet Profile Creation', () => {
    it('should create a new pet profile', () => {
      cy.visit('/add-pet');

      // Fill out pet form
      cy.get('[data-testid="pet-name-input"]').type('Buddy');
      cy.get('[data-testid="pet-species-select"]').select('dog');
      cy.get('[data-testid="pet-breed-input"]').type('Golden Retriever');
      cy.get('[data-testid="pet-age-input"]').type('3');
      cy.get('[data-testid="pet-size-select"]').select('large');

      // Add personality tags
      cy.get('[data-testid="personality-tags"]').type('friendly{enter}');
      cy.get('[data-testid="personality-tags"]').type('energetic{enter}');

      // Upload photos
      cy.get('[data-testid="photo-upload"]').selectFile('cypress/fixtures/pet-photo.jpg');

      // Submit form
      cy.contains('Create Pet Profile').click();

      // Should redirect to profile page
      cy.url().should('include', '/profile');
      cy.contains('Buddy').should('be.visible');
    });

    it('should validate required pet fields', () => {
      cy.visit('/add-pet');

      // Try to submit empty form
      cy.contains('Create Pet Profile').click();

      // Should show validation errors
      cy.contains('Pet name is required').should('be.visible');
      cy.contains('Species is required').should('be.visible');
      cy.contains('Age is required').should('be.visible');
    });
  });

  describe('Pet Profile Management', () => {
    it('should edit existing pet profile', () => {
      cy.visit('/profile');

      // Find pet profile and click edit
      cy.get('[data-testid="edit-pet-button"]').first().click();

      // Update pet information
      cy.get('[data-testid="pet-name-input"]').clear().type('Updated Buddy');
      cy.get('[data-testid="pet-description-input"]').type('This is an updated description');

      // Save changes
      cy.contains('Update Pet Profile').click();

      // Should show updated information
      cy.contains('Updated Buddy').should('be.visible');
    });

    it('should delete pet profile', () => {
      cy.visit('/profile');

      // Find pet profile and click delete
      cy.get('[data-testid="delete-pet-button"]').first().click();

      // Confirm deletion
      cy.contains('Yes, delete').click();

      // Should show confirmation
      cy.contains('Pet profile deleted').should('be.visible');
    });

    it('should add additional photos to pet profile', () => {
      cy.visit('/profile');

      // Find pet profile and click edit photos
      cy.get('[data-testid="edit-photos-button"]').first().click();

      // Upload new photo
      cy.get('[data-testid="additional-photo-upload"]').selectFile(
        'cypress/fixtures/new-photo.jpg',
      );

      // Save photos
      cy.contains('Save Photos').click();

      // Should show updated photo count
      cy.get('[data-testid="photo-count"]').should('contain.text', '2');
    });
  });

  describe('Profile Verification', () => {
    it('should display verification status', () => {
      cy.visit('/profile');

      // Should show verification badge
      cy.get('[data-testid="verification-badge"]').should('exist');
    });

    it('should initiate profile verification process', () => {
      cy.visit('/profile');

      // Click verify profile button
      cy.contains('Verify Profile').click();

      // Should navigate to verification page
      cy.url().should('include', '/verify');

      // Should show verification instructions
      cy.contains('Profile Verification').should('be.visible');
    });
  });

  describe('Privacy Settings', () => {
    it('should update privacy settings', () => {
      cy.visit('/profile');

      // Navigate to privacy settings
      cy.contains('Privacy').click();

      // Toggle privacy options
      cy.get('[data-testid="show-profile-toggle"]').click();
      cy.get('[data-testid="location-privacy-toggle"]').click();

      // Save privacy settings
      cy.contains('Save Privacy Settings').click();

      // Should show confirmation
      cy.contains('Privacy settings updated').should('be.visible');
    });
  });

  describe('Profile Analytics', () => {
    it('should display profile view statistics', () => {
      cy.visit('/profile');

      // Should show analytics section
      cy.contains('Profile Views').should('be.visible');

      // Should display view count
      cy.get('[data-testid="view-count"]').should('be.visible');
    });

    it('should show match statistics', () => {
      cy.visit('/profile');

      // Should show match rate
      cy.contains('Match Rate').should('be.visible');

      // Should display match count
      cy.get('[data-testid="match-count"]').should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle profile update errors gracefully', () => {
      cy.visit('/profile');

      // Simulate API error
      cy.intercept('PUT', '/api/users/**', { statusCode: 500 });

      // Try to update profile
      cy.contains('Edit Profile').click();
      cy.get('[data-testid="first-name-input"]').type('Error Test');
      cy.contains('Save Changes').click();

      // Should show error message
      cy.contains('Failed to update profile').should('be.visible');
    });

    it('should handle photo upload errors', () => {
      cy.visit('/add-pet');

      // Simulate upload error
      cy.intercept('POST', '/api/upload', { statusCode: 500 });

      // Try to upload photo
      cy.get('[data-testid="photo-upload"]').selectFile('cypress/fixtures/pet-photo.jpg');

      // Should show error message
      cy.contains('Failed to upload photo').should('be.visible');
    });
  });
});
