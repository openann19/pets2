import * as nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';
import logger from '../utils/logger';

// Email template data interfaces
export interface EmailVerificationData {
  firstName: string;
  verificationUrl: string;
}

export interface PasswordResetData {
  firstName: string;
  resetUrl: string;
}

export interface NewMatchData {
  userName: string;
  yourPetName: string;
  matchedPetName: string;
  yourPetPhoto: string;
  matchedPetPhoto: string;
  matchedOwnerName: string;
  chatUrl: string;
}

export interface PremiumWelcomeData {
  firstName: string;
  appUrl: string;
}

export interface NewMessageData {
  userName: string;
  senderName: string;
  message: string;
  chatUrl: string;
}

// Email template function type
export type EmailTemplateFunction<T = Record<string, any>> = (data: T) => {
  subject: string;
  html: string;
};

// Email template result interface
export interface EmailTemplate {
  subject: string;
  html: string;
}

// Email sending options interface
export interface SendEmailOptions {
  email: string;
  template: keyof typeof emailTemplates;
  data: EmailVerificationData | PasswordResetData | NewMatchData | PremiumWelcomeData | Record<string, any>;
}

// Email sending result interface
export interface EmailResult {
  success: boolean;
  messageId?: string;
  message?: string;
}

// Bulk email recipient interface
export interface BulkEmailRecipient {
  email: string;
  data?: Record<string, any>;
}

// Bulk email result interface
export interface BulkEmailResult {
  email: string;
  success: boolean;
  result?: EmailResult;
  error?: string;
}

// Create transporter function
const createTransporter = (): Transporter => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates with proper typing
const emailTemplates = {
  emailVerification: (data: EmailVerificationData): EmailTemplate => ({
    subject: 'Welcome to PawfectMatch - Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff69b4, #8a2be2); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🐾 Welcome to PawfectMatch!</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Hi ${data.firstName}! 👋</h2>
          <p>Thank you for joining PawfectMatch, the premium platform where pets find their perfect matches!</p>
          <p>To get started and ensure the security of your account, please verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background: #ff69b4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Verify My Email ✨
            </a>
          </div>
          <p>Once verified, you can:</p>
          <ul>
            <li>🐕 Create profiles for your pets</li>
            <li>❤️ Swipe and match with compatible pets</li>
            <li>💬 Chat with other pet owners</li>
            <li>📍 Find pets nearby</li>
            <li>🎯 Set your matching preferences</li>
          </ul>
          <p>If you didn't create this account, please ignore this email.</p>
          <p>Happy matching! 🎉</p>
          <p><strong>The PawfectMatch Team</strong></p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px;">
          <p>This link will expire in 24 hours for security reasons.</p>
          <p>© 2024 PawfectMatch. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  passwordReset: (data: PasswordResetData): EmailTemplate => ({
    subject: 'PawfectMatch - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff69b4, #8a2be2); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔐 Password Reset</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Hi ${data.firstName},</h2>
          <p>We received a request to reset your PawfectMatch password.</p>
          <p>Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Reset Password 🔑
            </a>
          </div>
          <p><strong>This link will expire in 10 minutes</strong> for security reasons.</p>
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          <p>For security tips:</p>
          <ul>
            <li>Use a strong, unique password</li>
            <li>Don't share your password with anyone</li>
            <li>Consider using a password manager</li>
          </ul>
          <p>Stay safe! 🛡️</p>
          <p><strong>The PawfectMatch Team</strong></p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px;">
          <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all;">${data.resetUrl}</p>
          <p>© 2024 PawfectMatch. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  newMatch: (data: NewMatchData): EmailTemplate => ({
    subject: '🎉 You have a new match on PawfectMatch!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff69b4, #8a2be2); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 It's a Match!</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Congratulations ${data.userName}! 🎊</h2>
          <p><strong>${data.yourPetName}</strong> and <strong>${data.matchedPetName}</strong> liked each other!</p>
          <div style="display: flex; justify-content: center; margin: 20px 0;">
            <div style="text-align: center; margin: 0 20px;">
              <img src="${data.yourPetPhoto}" alt="${data.yourPetName}" 
                   style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
              <p><strong>${data.yourPetName}</strong></p>
            </div>
            <div style="font-size: 30px; align-self: center;">❤️</div>
            <div style="text-align: center; margin: 0 20px;">
              <img src="${data.matchedPetPhoto}" alt="${data.matchedPetName}" 
                   style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
              <p><strong>${data.matchedPetName}</strong></p>
            </div>
          </div>
          <p>Start a conversation with <strong>${data.matchedOwnerName}</strong> and plan your pets' first meetup!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.chatUrl}" 
               style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Start Chatting 💬
            </a>
          </div>
          <p>Tips for a successful meetup:</p>
          <ul>
            <li>Meet in a public, neutral location</li>
            <li>Bring water and treats</li>
            <li>Keep the first meeting short and positive</li>
            <li>Watch for signs of stress in both pets</li>
          </ul>
          <p>Have fun! 🐾</p>
          <p><strong>The PawfectMatch Team</strong></p>
        </div>
      </div>
    `
  }),

  premiumWelcome: (data: PremiumWelcomeData): EmailTemplate => ({
    subject: '🌟 Welcome to PawfectMatch Premium!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ffd700, #ff69b4); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🌟 Premium Activated!</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Welcome to Premium, ${data.firstName}! 🎉</h2>
          <p>Your premium subscription is now active! Here's what you can do:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>✨ Premium Features Unlocked:</h3>
            <ul>
              <li>🚀 <strong>Unlimited Likes</strong> - No daily limits</li>
              <li>⭐ <strong>Super Likes</strong> - Stand out from the crowd</li>
              <li>👁️ <strong>See Who Liked You</strong> - Browse your admirers</li>
              <li>🎯 <strong>Advanced Filters</strong> - Find exactly what you're looking for</li>
              <li>📈 <strong>Boost Your Pets</strong> - Get more visibility</li>
              <li>🤖 <strong>AI Recommendations</strong> - Smart matching technology</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.appUrl}" 
               style="background: #ffd700; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Explore Premium Features 🚀
            </a>
          </div>
          <p>Thank you for supporting PawfectMatch! Your subscription helps us:</p>
          <ul>
            <li>💡 Develop new features</li>
            <li>🛡️ Keep the platform safe and secure</li>
            <li>🤝 Support animal welfare organizations</li>
            <li>🆕 Continuously improve the matching experience</li>
          </ul>
          <p>Happy premium matching! 🎊</p>
          <p><strong>The PawfectMatch Team</strong></p>
        </div>
      </div>
    `
  })
} as const;

/**
 * Send email using configured template
 * @param options - Email options including recipient, template, and data
 * @returns Promise resolving to email result
 */
export const sendEmail = async (options: SendEmailOptions): Promise<EmailResult> => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('Email service not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    const templateFunc = emailTemplates[options.template];
    
    if (!templateFunc) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const { subject, html } = templateFunc(options.data as any);

    const mailOptions: SendMailOptions = {
      from: {
        name: 'PawfectMatch',
        address: process.env.EMAIL_USER || 'noreply@pawfectmatch.com'
      },
      to: options.email,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully', { messageId: result.messageId, to: options.email });
    return { success: true, messageId: result.messageId };

  } catch (error) {
    logger.error('Email sending error:', { error });
    throw error;
  }
};

/**
 * Send bulk emails (for newsletters, announcements)
 * @param recipients - Array of recipient objects with email and data
 * @param template - Template name to use
 * @param commonData - Common data for all recipients
 * @returns Promise resolving to array of results
 */
export const sendBulkEmails = async (
  recipients: BulkEmailRecipient[],
  template: keyof typeof emailTemplates,
  commonData: Record<string, any> = {}
): Promise<BulkEmailResult[]> => {
  const results: BulkEmailResult[] = [];
  
  for (const recipient of recipients) {
    try {
      const result = await sendEmail({
        email: recipient.email,
        template,
        data: { ...commonData, ...recipient.data }
      });
      results.push({ email: recipient.email, success: true, result });
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to send email', { email: recipient.email, error });
      results.push({ email: recipient.email, success: false, error: errorMessage });
    }
  }
  
  return results;
};

/**
 * Send notification email with custom subject and message
 * @param email - Recipient email address
 * @param subject - Email subject line
 * @param message - Email message content (HTML)
 * @returns Promise resolving to email result
 */
export const sendNotificationEmail = async (
  email: string,
  subject: string,
  message: string
): Promise<EmailResult> => {
  try {
    const transporter = createTransporter();

    const mailOptions: SendMailOptions = {
      from: {
        name: 'PawfectMatch',
        address: process.env.EMAIL_USER || 'noreply@pawfectmatch.com'
      },
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ff69b4, #8a2be2); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🐾 PawfectMatch</h1>
          </div>
          <div style="padding: 20px; background: white;">
            ${message}
          </div>
          <div style="background: #f8f9fa; padding: 15px; text-align: center; color: #6c757d; font-size: 12px;">
            <p>© 2024 PawfectMatch. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    logger.error('Notification email error:', { error });
    throw error;
  }
};

// Export default object for backward compatibility
export default {
  sendEmail,
  sendBulkEmails,
  sendNotificationEmail
};
