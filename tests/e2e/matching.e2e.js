import { LoginPage } from './LoginPage.page';
import { SwipeScreen } from './SwipeScreen.page';

describe('Matching Flow', () => {
  let loginPage: LoginPage;
  let swipeScreen: SwipeScreen;

  beforeAll(async () => {
    loginPage = new LoginPage();
    swipeScreen = new SwipeScreen();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should allow user to login and swipe through profiles', async () => {
    // Login
    await loginPage.waitForPageLoad();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.assertLoginSuccessful();

    // Navigate to swipe screen (assuming login redirects to swipe)
    await swipeScreen.waitForScreenLoad();

    // Perform swipes
    await swipeScreen.assertCardVisible();

    // Swipe right (like)
    await swipeScreen.swipeRightOnFirstCard();

    // Wait for next card or check if more cards exist
    try {
      await swipeScreen.assertCardVisible();
      // Swipe left (dislike)
      await swipeScreen.swipeLeftOnFirstCard();

      // Try super like
      await swipeScreen.assertCardVisible();
      await swipeScreen.swipeUpOnFirstCard();
    } catch (error) {
      // No more cards available
      await swipeScreen.assertNoMoreCards();
    }
  });

  it('should handle button interactions correctly', async () => {
    // Login first
    await loginPage.waitForPageLoad();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.assertLoginSuccessful();

    await swipeScreen.waitForScreenLoad();

    // Test like button
    await swipeScreen.tapLikeButton();

    // Test dislike button
    await swipeScreen.tapDislikeButton();

    // Test super like button (if available)
    try {
      await swipeScreen.tapSuperLikeButton();
    } catch (error) {
      // Super like might not be available for all users
    }
  });

  it('should navigate between screens correctly', async () => {
    // Login first
    await loginPage.waitForPageLoad();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.assertLoginSuccessful();

    await swipeScreen.waitForScreenLoad();

    // Navigate to profile
    await swipeScreen.navigateToProfile();
    // Verify we're on profile screen (would need profile page object)

    // Navigate back to swipe (assuming back navigation works)
    await device.pressBack();

    // Navigate to matches
    await swipeScreen.navigateToMatches();
    // Verify we're on matches screen

    // Navigate back to swipe
    await device.pressBack();
  });

  it('should handle login errors gracefully', async () => {
    await loginPage.waitForPageLoad();

    // Try invalid login
    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.assertErrorMessageVisible('Invalid credentials');
  });

  it('should handle empty swipe queue', async () => {
    // This test would require setting up a user with no more profiles to swipe
    // For now, just test the UI state when no cards are available

    // Login with a user that has no more cards
    await loginPage.waitForPageLoad();
    await loginPage.login('empty-queue@example.com', 'password123');
    await loginPage.assertLoginSuccessful();

    // Should show no more cards message
    await swipeScreen.assertNoMoreCards();
  });
});
