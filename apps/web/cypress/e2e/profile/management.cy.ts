/**
 * E2E Tests for Profile Management
 * Comprehensive testing of profile and pet management features
 */

describe('Profile Management', () => {
  beforeEach(() => {
    cy.clearAllStorage();
    cy.clearCookies();
    cy.loginAsTestUser();
  });

  describe('User Profile', () => {
    it('should display user profile information', () => {
      cy.visit('/profile');
      cy.get('[data-testid="user-profile"]').should('be.visible');
      cy.get('[data-testid="user-name"]').should('be.visible');
      cy.get('[data-testid="user-email"]').should('be.visible');
      cy.get('[data-testid="user-location"]').should('be.visible');
      cy.get('[data-testid="user-bio"]').should('be.visible');
    });

    it('should allow editing user profile', () => {
      cy.intercept('PUT', '**/profile', { statusCode: 200 }).as('updateProfile');

      cy.visit('/profile');
      cy.get('[data-testid="edit-profile-button"]').click();

      cy.get('[data-testid="edit-profile-modal"]').should('be.visible');
      cy.get('[data-testid="name-input"]').clear().type('Updated Name');
      cy.get('[data-testid="bio-input"]').clear().type('Updated bio');
      cy.get('[data-testid="save-profile-button"]').click();

      cy.wait('@updateProfile');
      cy.get('[data-testid="user-name"]').should('contain', 'Updated Name');
      cy.get('[data-testid="user-bio"]').should('contain', 'Updated bio');
    });

    it('should validate profile form', () => {
      cy.visit('/profile');
      cy.get('[data-testid="edit-profile-button"]').click();

      cy.get('[data-testid="name-input"]').clear();
      cy.get('[data-testid="save-profile-button"]').click();

      cy.get('[data-testid="validation-error"]').should('be.visible');
      cy.contains('Name is required').should('be.visible');
    });

    it('should upload profile photo', () => {
      cy.intercept('POST', '**/profile/photo', { statusCode: 200 }).as('uploadPhoto');

      cy.visit('/profile');
      cy.get('[data-testid="edit-profile-button"]').click();

      cy.get('[data-testid="photo-upload-button"]').click();
      cy.get('[data-testid="photo-input"]').selectFile('cypress/fixtures/test-image.jpg', {
        force: true,
      });
      cy.get('[data-testid="save-profile-button"]').click();

      cy.wait('@uploadPhoto');
      cy.get('[data-testid="user-photo"]').should('be.visible');
    });
  });

  describe('Pet Management', () => {
    it('should display pet list', () => {
      cy.visit('/profile');
      cy.get('[data-testid="pets-section"]').should('be.visible');
      cy.get('[data-testid="pet-card"]').should('have.length.at.least', 1);
    });

    it('should create new pet', () => {
      cy.intercept('POST', '**/pets', { statusCode: 200 }).as('createPet');

      cy.visit('/profile');
      cy.get('[data-testid="add-pet-button"]').click();

      cy.get('[data-testid="create-pet-modal"]').should('be.visible');
      cy.get('[data-testid="pet-name-input"]').type('Buddy');
      cy.get('[data-testid="pet-species-select"]').select('dog');
      cy.get('[data-testid="pet-breed-input"]').type('Golden Retriever');
      cy.get('[data-testid="pet-age-input"]').type('3');
      cy.get('[data-testid="pet-gender-select"]').select('male');
      cy.get('[data-testid="pet-size-select"]').select('large');
      cy.get('[data-testid="pet-description-input"]').type('Friendly and energetic dog');
      cy.get('[data-testid="save-pet-button"]').click();

      cy.wait('@createPet');
      cy.get('[data-testid="pet-card"]').last().should('contain', 'Buddy');
    });

    it('should edit existing pet', () => {
      cy.intercept('PUT', '**/pets/*', { statusCode: 200 }).as('updatePet');

      cy.visit('/profile');
      cy.get('[data-testid="pet-card"]').first().click();
      cy.get('[data-testid="edit-pet-button"]').click();

      cy.get('[data-testid="edit-pet-modal"]').should('be.visible');
      cy.get('[data-testid="pet-name-input"]').clear().type('Updated Pet Name');
      cy.get('[data-testid="save-pet-button"]').click();

      cy.wait('@updatePet');
      cy.get('[data-testid="pet-card"]').first().should('contain', 'Updated Pet Name');
    });

    it('should delete pet', () => {
      cy.intercept('DELETE', '**/pets/*', { statusCode: 200 }).as('deletePet');

      cy.visit('/profile');
      cy.get('[data-testid="pet-card"]').first().click();
      cy.get('[data-testid="delete-pet-button"]').click();
      cy.get('[data-testid="confirm-delete"]').click();

      cy.wait('@deletePet');
      cy.get('[data-testid="pet-card"]').should('have.length', 0);
    });

    it('should validate pet form', () => {
      cy.visit('/profile');
      cy.get('[data-testid="add-pet-button"]').click();

      cy.get('[data-testid="save-pet-button"]').click();

      cy.get('[data-testid="validation-error"]').should('be.visible');
      cy.contains('Pet name is required').should('be.visible');
      cy.contains('Species is required').should('be.visible');
    });
  });

  describe('Pet Photos', () => {
    it('should upload pet photos', () => {
      cy.intercept('POST', '**/pets/*/photos', { statusCode: 200 }).as('uploadPetPhoto');

      cy.visit('/profile');
      cy.get('[data-testid="pet-card"]').first().click();
      cy.get('[data-testid="add-photo-button"]').click();

      cy.get('[data-testid="photo-upload-modal"]').should('be.visible');
      cy.get('[data-testid="photo-input"]').selectFile('cypress/fixtures/test-image.jpg', {
        force: true,
      });
      cy.get('[data-testid="upload-button"]').click();

      cy.wait('@uploadPetPhoto');
      cy.get('[data-testid="pet-photo"]').should('be.visible');
    });

    it('should reorder pet photos', () => {
      cy.intercept('PUT', '**/pets/*/photos/reorder', { statusCode: 200 }).as('reorderPhotos');

      cy.visit('/profile');
      cy.get('[data-testid="pet-card"]').first().click();

      // Drag and drop to reorder
      cy.get('[data-testid="pet-photo"]').first().trigger('dragstart');
      cy.get('[data-testid="pet-photo"]').last().trigger('drop');

      cy.wait('@reorderPhotos');
      cy.contains('Photos reordered').should('be.visible');
    });

    it('should delete pet photo', () => {
      cy.intercept('DELETE', '**/pets/*/photos/*', { statusCode: 200 }).as('deletePhoto');

      cy.visit('/profile');
      cy.get('[data-testid="pet-card"]').first().click();

      cy.get('[data-testid="pet-photo"]').first().trigger('mouseover');
      cy.get('[data-testid="delete-photo-button"]').click();
      cy.get('[data-testid="confirm-delete"]').click();

      cy.wait('@deletePhoto');
      cy.get('[data-testid="pet-photo"]').should('have.length', 0);
    });

    it('should set primary photo', () => {
      cy.intercept('PUT', '**/pets/*/photos/*/primary', { statusCode: 200 }).as('setPrimary');

      cy.visit('/profile');
      cy.get('[data-testid="pet-card"]').first().click();

      cy.get('[data-testid="pet-photo"]').last().trigger('mouseover');
      cy.get('[data-testid="set-primary-button"]').click();

      cy.wait('@setPrimary');
      cy.get('[data-testid="pet-photo"]').last().should('have.class', 'primary');
    });
  });

  describe('Pet Preferences', () => {
    it('should display pet preferences', () => {
      cy.visit('/profile');
      cy.get('[data-testid="preferences-tab"]').click();

      cy.get('[data-testid="preferences-section"]').should('be.visible');
      cy.get('[data-testid="age-range-slider"]').should('be.visible');
      cy.get('[data-testid="species-checkboxes"]').should('be.visible');
      cy.get('[data-testid="size-checkboxes"]').should('be.visible');
      cy.get('[data-testid="gender-checkboxes"]').should('be.visible');
    });

    it('should update pet preferences', () => {
      cy.intercept('PUT', '**/preferences', { statusCode: 200 }).as('updatePreferences');

      cy.visit('/profile');
      cy.get('[data-testid="preferences-tab"]').click();

      cy.get('[data-testid="age-range-slider"]').invoke('val', 25).trigger('change');
      cy.get('[data-testid="species-dog"]').check();
      cy.get('[data-testid="size-large"]').check();
      cy.get('[data-testid="save-preferences"]').click();

      cy.wait('@updatePreferences');
      cy.contains('Preferences updated').should('be.visible');
    });

    it('should reset preferences to default', () => {
      cy.intercept('DELETE', '**/preferences', { statusCode: 200 }).as('resetPreferences');

      cy.visit('/profile');
      cy.get('[data-testid="preferences-tab"]').click();

      cy.get('[data-testid="reset-preferences"]').click();
      cy.get('[data-testid="confirm-reset"]').click();

      cy.wait('@resetPreferences');
      cy.contains('Preferences reset to default').should('be.visible');
    });
  });

  describe('Location Settings', () => {
    it('should display current location', () => {
      cy.visit('/profile');
      cy.get('[data-testid="location-tab"]').click();

      cy.get('[data-testid="current-location"]').should('be.visible');
      cy.get('[data-testid="location-map"]').should('be.visible');
    });

    it('should update location', () => {
      cy.intercept('PUT', '**/location', { statusCode: 200 }).as('updateLocation');

      cy.visit('/profile');
      cy.get('[data-testid="location-tab"]').click();

      cy.get('[data-testid="update-location-button"]').click();
      cy.get('[data-testid="location-input"]').type('San Francisco, CA');
      cy.get('[data-testid="save-location"]').click();

      cy.wait('@updateLocation');
      cy.get('[data-testid="current-location"]').should('contain', 'San Francisco');
    });

    it('should use current GPS location', () => {
      cy.mockGeolocation(37.7749, -122.4194);
      cy.intercept('PUT', '**/location', { statusCode: 200 }).as('updateLocation');

      cy.visit('/profile');
      cy.get('[data-testid="location-tab"]').click();

      cy.get('[data-testid="use-current-location"]').click();

      cy.wait('@updateLocation');
      cy.get('[data-testid="current-location"]').should('contain', 'San Francisco');
    });

    it('should set location privacy', () => {
      cy.intercept('PUT', '**/location/privacy', { statusCode: 200 }).as('updatePrivacy');

      cy.visit('/profile');
      cy.get('[data-testid="location-tab"]').click();

      cy.get('[data-testid="location-privacy-select"]').select('city');
      cy.get('[data-testid="save-privacy"]').click();

      cy.wait('@updatePrivacy');
      cy.contains('Location privacy updated').should('be.visible');
    });
  });

  describe('Account Settings', () => {
    it('should display account settings', () => {
      cy.visit('/profile');
      cy.get('[data-testid="account-tab"]').click();

      cy.get('[data-testid="account-settings"]').should('be.visible');
      cy.get('[data-testid="email-settings"]').should('be.visible');
      cy.get('[data-testid="password-settings"]').should('be.visible');
      cy.get('[data-testid="notification-settings"]').should('be.visible');
    });

    it('should update email', () => {
      cy.intercept('PUT', '**/account/email', { statusCode: 200 }).as('updateEmail');

      cy.visit('/profile');
      cy.get('[data-testid="account-tab"]').click();

      cy.get('[data-testid="email-input"]').clear().type('newemail@example.com');
      cy.get('[data-testid="save-email"]').click();

      cy.wait('@updateEmail');
      cy.contains('Email updated successfully').should('be.visible');
    });

    it('should change password', () => {
      cy.intercept('PUT', '**/account/password', { statusCode: 200 }).as('changePassword');

      cy.visit('/profile');
      cy.get('[data-testid="account-tab"]').click();

      cy.get('[data-testid="current-password"]').type('oldpassword');
      cy.get('[data-testid="new-password"]').type('newpassword123');
      cy.get('[data-testid="confirm-password"]').type('newpassword123');
      cy.get('[data-testid="save-password"]').click();

      cy.wait('@changePassword');
      cy.contains('Password changed successfully').should('be.visible');
    });

    it('should update notification preferences', () => {
      cy.intercept('PUT', '**/notifications', { statusCode: 200 }).as('updateNotifications');

      cy.visit('/profile');
      cy.get('[data-testid="account-tab"]').click();

      cy.get('[data-testid="email-notifications"]').uncheck();
      cy.get('[data-testid="push-notifications"]').check();
      cy.get('[data-testid="save-notifications"]').click();

      cy.wait('@updateNotifications');
      cy.contains('Notification preferences updated').should('be.visible');
    });
  });

  describe('Privacy Settings', () => {
    it('should display privacy settings', () => {
      cy.visit('/profile');
      cy.get('[data-testid="privacy-tab"]').click();

      cy.get('[data-testid="privacy-settings"]').should('be.visible');
      cy.get('[data-testid="profile-visibility"]').should('be.visible');
      cy.get('[data-testid="data-sharing"]').should('be.visible');
      cy.get('[data-testid="blocked-users"]').should('be.visible');
    });

    it('should update profile visibility', () => {
      cy.intercept('PUT', '**/privacy/visibility', { statusCode: 200 }).as('updateVisibility');

      cy.visit('/profile');
      cy.get('[data-testid="privacy-tab"]').click();

      cy.get('[data-testid="profile-visibility-select"]').select('private');
      cy.get('[data-testid="save-visibility"]').click();

      cy.wait('@updateVisibility');
      cy.contains('Profile visibility updated').should('be.visible');
    });

    it('should manage blocked users', () => {
      cy.intercept('GET', '**/blocked-users', {
        statusCode: 200,
        body: { users: [{ id: 'user-1', name: 'Blocked User' }] },
      }).as('getBlockedUsers');

      cy.visit('/profile');
      cy.get('[data-testid="privacy-tab"]').click();

      cy.wait('@getBlockedUsers');
      cy.get('[data-testid="blocked-user"]').should('contain', 'Blocked User');
    });

    it('should unblock user', () => {
      cy.intercept('DELETE', '**/blocked-users/*', { statusCode: 200 }).as('unblockUser');

      cy.visit('/profile');
      cy.get('[data-testid="privacy-tab"]').click();

      cy.get('[data-testid="unblock-button"]').click();
      cy.get('[data-testid="confirm-unblock"]').click();

      cy.wait('@unblockUser');
      cy.contains('User unblocked').should('be.visible');
    });
  });

  describe('Data Export', () => {
    it('should export user data', () => {
      cy.intercept('POST', '**/export-data', { statusCode: 200 }).as('exportData');

      cy.visit('/profile');
      cy.get('[data-testid="account-tab"]').click();

      cy.get('[data-testid="export-data-button"]').click();
      cy.get('[data-testid="confirm-export"]').click();

      cy.wait('@exportData');
      cy.contains('Data export started').should('be.visible');
    });

    it('should download exported data', () => {
      cy.intercept('GET', '**/export-data/download', {
        statusCode: 200,
        body: 'exported-data',
      }).as('downloadData');

      cy.visit('/profile');
      cy.get('[data-testid="account-tab"]').click();

      cy.get('[data-testid="download-export"]').click();

      cy.wait('@downloadData');
      cy.contains('Download started').should('be.visible');
    });
  });

  describe('Account Deletion', () => {
    it('should delete account', () => {
      cy.intercept('DELETE', '**/account', { statusCode: 200 }).as('deleteAccount');

      cy.visit('/profile');
      cy.get('[data-testid="account-tab"]').click();

      cy.get('[data-testid="delete-account-button"]').click();
      cy.get('[data-testid="confirm-delete-account"]').click();
      cy.get('[data-testid="type-confirmation"]').type('DELETE');
      cy.get('[data-testid="final-confirm"]').click();

      cy.wait('@deleteAccount');
      cy.url().should('include', '/login');
      cy.contains('Account deleted successfully').should('be.visible');
    });

    it('should cancel account deletion', () => {
      cy.visit('/profile');
      cy.get('[data-testid="account-tab"]').click();

      cy.get('[data-testid="delete-account-button"]').click();
      cy.get('[data-testid="cancel-delete"]').click();

      cy.get('[data-testid="delete-account-modal"]').should('not.exist');
    });
  });

  describe('Error Handling', () => {
    it('should handle profile update error', () => {
      cy.intercept('PUT', '**/profile', {
        statusCode: 500,
        body: { message: 'Update failed' },
      }).as('updateError');

      cy.visit('/profile');
      cy.get('[data-testid="edit-profile-button"]').click();

      cy.get('[data-testid="name-input"]').clear().type('Updated Name');
      cy.get('[data-testid="save-profile-button"]').click();

      cy.wait('@updateError');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.contains('Update failed').should('be.visible');
    });

    it('should handle pet creation error', () => {
      cy.intercept('POST', '**/pets', {
        statusCode: 400,
        body: { message: 'Invalid pet data' },
      }).as('createPetError');

      cy.visit('/profile');
      cy.get('[data-testid="add-pet-button"]').click();

      cy.get('[data-testid="pet-name-input"]').type('Buddy');
      cy.get('[data-testid="save-pet-button"]').click();

      cy.wait('@createPetError');
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.contains('Invalid pet data').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible with screen readers', () => {
      cy.visit('/profile');
      cy.checkPageA11y();
    });

    it('should support keyboard navigation', () => {
      cy.visit('/profile');
      cy.get('[data-testid="edit-profile-button"]').focus();
      cy.get('[data-testid="edit-profile-button"]').pressKey('Enter');
      cy.get('[data-testid="edit-profile-modal"]').should('be.visible');
    });

    it('should have proper ARIA labels', () => {
      cy.visit('/profile');
      cy.get('[data-testid="edit-profile-button"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="add-pet-button"]').should('have.attr', 'aria-label');
    });
  });

  describe('Performance', () => {
    it('should load profile page quickly', () => {
      cy.measurePageLoad('/profile');
    });

    it('should handle large pet photo galleries efficiently', () => {
      cy.intercept('GET', '**/pets/*/photos', {
        statusCode: 200,
        body: {
          photos: Array.from({ length: 50 }, (_, i) => ({
            id: `photo-${i}`,
            url: `photo-${i}.jpg`,
          })),
        },
      }).as('getManyPhotos');

      cy.visit('/profile');
      cy.get('[data-testid="pet-card"]').first().click();
      cy.wait('@getManyPhotos');

      cy.get('[data-testid="pet-photo"]').should('have.length.at.least', 10);
    });
  });
});
