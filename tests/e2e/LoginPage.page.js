import { by, element, expect } from 'detox';

export class LoginPage {
  // Element selectors
  get emailInput() {
    return element(by.id('email-input'));
  }

  get passwordInput() {
    return element(by.id('password-input'));
  }

  get loginButton() {
    return element(by.id('login-button'));
  }

  get signUpButton() {
    return element(by.id('signup-button'));
  }

  get forgotPasswordButton() {
    return element(by.id('forgot-password-button'));
  }

  get errorMessage() {
    return element(by.id('error-message'));
  }

  // Actions
  async login(email: string, password: string) {
    await this.emailInput.typeText(email);
    await this.passwordInput.typeText(password);
    await this.loginButton.tap();
  }

  async navigateToSignUp() {
    await this.signUpButton.tap();
  }

  async navigateToForgotPassword() {
    await this.forgotPasswordButton.tap();
  }

  async assertLoginSuccessful() {
    await expect(this.loginButton).toBeNotVisible();
  }

  async assertErrorMessageVisible(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toHaveText(message);
    }
  }

  async waitForPageLoad() {
    await expect(this.emailInput).toBeVisible();
  }
}
