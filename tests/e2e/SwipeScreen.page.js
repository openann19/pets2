import { by, element, expect } from 'detox';

export class SwipeScreen {
  // Element selectors
  get firstCard() {
    return element(by.id('swipe-card-0'));
  }

  get likeButton() {
    return element(by.id('like-button'));
  }

  get dislikeButton() {
    return element(by.id('dislike-button'));
  }

  get superLikeButton() {
    return element(by.id('super-like-button'));
  }

  get profileButton() {
    return element(by.id('profile-button'));
  }

  get matchesButton() {
    return element(by.id('matches-button'));
  }

  get settingsButton() {
    return element(by.id('settings-button'));
  }

  get noMoreCardsMessage() {
    return element(by.id('no-more-cards'));
  }

  // Actions
  async swipeRightOnFirstCard() {
    await this.firstCard.swipe('right');
  }

  async swipeLeftOnFirstCard() {
    await this.firstCard.swipe('left');
  }

  async swipeUpOnFirstCard() {
    await this.firstCard.swipe('up');
  }

  async tapLikeButton() {
    await this.likeButton.tap();
  }

  async tapDislikeButton() {
    await this.dislikeButton.tap();
  }

  async tapSuperLikeButton() {
    await this.superLikeButton.tap();
  }

  async navigateToProfile() {
    await this.profileButton.tap();
  }

  async navigateToMatches() {
    await this.matchesButton.tap();
  }

  async navigateToSettings() {
    await this.settingsButton.tap();
  }

  async assertCardVisible(index = 0) {
    const card = element(by.id(`swipe-card-${index}`));
    await expect(card).toBeVisible();
  }

  async assertNoMoreCards() {
    await expect(this.noMoreCardsMessage).toBeVisible();
  }

  async waitForScreenLoad() {
    await expect(this.firstCard).toBeVisible();
  }

  async getCardCount() {
    // This would need to be implemented based on the actual UI structure
    // For now, just check if at least one card exists
    try {
      await expect(this.firstCard).toBeVisible();
      return 1;
    } catch {
      return 0;
    }
  }
}
