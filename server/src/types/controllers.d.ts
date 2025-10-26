import { Request, Response, NextFunction } from 'express';
import { AuthRequest, ApiResponse } from './express';

/**
 * Base controller type for all route handlers
 */
export type Controller = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

/**
 * Typed controller for authenticated routes
 */
export type AuthenticatedController = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void> | void;

/**
 * Common controller response utilities
 */
export interface ControllerHelpers {
  success: <T>(data: T, message?: string) => ApiResponse<T>;
  error: (message: string, statusCode?: number) => ApiResponse;
  paginated: <T>(data: T[], meta: { page: number; limit: number; total: number }) => ApiResponse<T[]>;
}

/**
 * Auth controller functions
 */
export interface IAuthController {
  register(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
  forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  setup2FA(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  verify2FA(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  disable2FA(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  setup2FASmsEmail(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  verify2FASmsEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
  send2FACode(req: Request, res: Response, next: NextFunction): Promise<void>;
  biometricLogin(req: Request, res: Response, next: NextFunction): Promise<void>;
  setupBiometric(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  disableBiometric(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  refreshBiometricToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  logoutAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Pet controller functions
 */
export interface IPetController {
  createPet(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getPetById(req: Request, res: Response, next: NextFunction): Promise<void>;
  updatePet(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  deletePet(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getUserPets(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  uploadPetPhoto(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  deletePetPhoto(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Match controller functions
 */
export interface IMatchController {
  createMatch(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getMatches(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getMatchById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  updateMatch(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  deleteMatch(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Chat controller functions
 */
export interface IChatController {
  sendMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getConversations(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getConversationById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  deleteMessage(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Premium controller functions
 */
export interface IPremiumController {
  getSubscriptionStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  createCheckoutSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  createPortalSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  cancelSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getPremiumUsage(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  validatePremiumFeature(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Admin controller functions
 */
export interface IAdminController {
  getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void>;
  moderationActions(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Notification controller functions
 */
export interface INotificationController {
  getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  deleteNotification(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Stories controller functions
 */
export interface IStoriesController {
  createStory(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getStories(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  viewStory(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  deleteStory(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Favorites controller functions
 */
export interface IFavoritesController {
  addFavorite(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  removeFavorite(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  getFavorites(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Profile controller functions
 */
export interface IProfileController {
  getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  uploadAvatar(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  deleteAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Session controller functions
 */
export interface ISessionController {
  changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  logoutAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Account controller functions
 */
export interface IAccountController {
  updateAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  deleteAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  exportData(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Biometric controller functions
 */
export interface IBiometricController {
  setupBiometric(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  disableBiometric(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
  authenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Leaderboard controller functions
 */
export interface ILeaderboardController {
  getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUserRank(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}

/**
 * Webhook controller functions
 */
export interface IWebhookController {
  stripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
}
