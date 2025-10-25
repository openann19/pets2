import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import { EmailService } from '../types';

// Email template data types
interface EmailVerificationData {
  firstName: string;
  verificationCode: string;
}

interface PasswordResetData {
  firstName: string;
  resetToken: string;
}

interface MatchNotificationData {
  firstName: string;
  matchName: string;
  matchPhoto?: string;
}

interface WelcomeEmailData {
  firstName: string;
}

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env['EMAIL_HOST'] || 'smtp.gmail.com',
    port: Number(process.env['EMAIL_PORT'] || 587),
    secure: false,
    auth: {
      user: process.env['EMAIL_USER'],
      pass: process.env['EMAIL_PASS'],
    },
  });
};

// Email templates
const emailTemplates = {
  emailVerification: (data: EmailVerificationData) => ({
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
    `,
  }),

  passwordReset: (data: PasswordResetData) => ({
    subject: 'Reset Your PawfectMatch Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff69b4, #8a2be2); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔐 Password Reset</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Hi ${data.firstName}! 👋</h2>
          <p>We received a request to reset your password for your PawfectMatch account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: #ff69b4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Reset Password 🔑
            </a>
          </div>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>For security reasons, this link will expire in 1 hour.</p>
          <p>Best regards,<br><strong>The PawfectMatch Team</strong></p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px;">
          <p>© 2024 PawfectMatch. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  matchNotification: (data: MatchNotificationData) => ({
    subject: '🎉 You have a new match on PawfectMatch!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff69b4, #8a2be2); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 It's a Match!</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Congratulations ${data.firstName}! 🎊</h2>
          <p>Great news! ${data.matchedPetName} and your pet ${data.yourPetName} are a perfect match!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.matchUrl}" 
               style="background: #ff69b4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              View Match 💕
            </a>
          </div>
          <p>Start chatting and plan your pets' first meeting!</p>
          <p>Happy matching! 🐾</p>
          <p><strong>The PawfectMatch Team</strong></p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px;">
          <p>© 2024 PawfectMatch. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  welcomeEmail: (data: WelcomeEmailData) => ({
    subject: 'Welcome to PawfectMatch - Let\'s Get Started!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff69b4, #8a2be2); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🐾 Welcome to PawfectMatch!</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2>Hi ${data.firstName}! 👋</h2>
          <p>Welcome to PawfectMatch, where pets find their perfect matches!</p>
          <p>Your account is now active and ready to use. Here's what you can do next:</p>
          <ul>
            <li>🐕 <strong>Create Pet Profiles:</strong> Add photos and details about your pets</li>
            <li>🎯 <strong>Set Preferences:</strong> Tell us what you're looking for</li>
            <li>❤️ <strong>Start Swiping:</strong> Discover compatible pets nearby</li>
            <li>💬 <strong>Chat & Connect:</strong> Message with other pet owners</li>
            <li>📍 <strong>Find Local Events:</strong> Join pet meetups in your area</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.appUrl}" 
               style="background: #ff69b4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Get Started 🚀
            </a>
          </div>
          <p>Need help getting started? Check out our <a href="${data.helpUrl}">help center</a> or reply to this email.</p>
          <p>Happy matching! 🎉</p>
          <p><strong>The PawfectMatch Team</strong></p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px;">
          <p>© 2024 PawfectMatch. All rights reserved.</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Send email using nodemailer
 * @param to - Recipient email
 * @param subject - Email subject
 * @param html - Email HTML content
 * @param text - Email text content (optional)
 * @returns Promise<void>
 */
export const sendEmail = async (to: string, subject: string, html: string, text?: string): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"PawfectMatch" <${process.env['EMAIL_USER']}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully:', { to, subject, messageId: result.messageId });
  } catch (error) {
    logger.error('Error sending email:', { error, to, subject });
    throw error;
  }
};

/**
 * Send welcome email
 * @param userEmail - User email
 * @param userName - User name
 * @returns Promise<void>
 */
export const sendWelcomeEmail = async (userEmail: string, userName: string): Promise<void> => {
  try {
    const template = emailTemplates.welcomeEmail({
      firstName: userName,
      appUrl: process.env['CLIENT_URL'] || 'https://pawfectmatch.com',
      helpUrl: `${process.env['CLIENT_URL'] || 'https://pawfectmatch.com'}/help`,
    });

    await sendEmail(userEmail, template.subject, template.html);
  } catch (error) {
    logger.error('Error sending welcome email:', { error, userEmail, userName });
    throw error;
  }
};

/**
 * Send verification email
 * @param userEmail - User email
 * @param verificationCode - Verification code
 * @returns Promise<void>
 */
export const sendVerificationEmail = async (userEmail: string, verificationCode: string): Promise<void> => {
  try {
    const template = emailTemplates.emailVerification({
      firstName: userEmail.split('@')[0], // Use email prefix as name
      verificationUrl: `${process.env['CLIENT_URL'] || 'https://pawfectmatch.com'}/verify?code=${verificationCode}`,
    });

    await sendEmail(userEmail, template.subject, template.html);
  } catch (error) {
    logger.error('Error sending verification email:', { error, userEmail });
    throw error;
  }
};

/**
 * Send password reset email
 * @param userEmail - User email
 * @param resetToken - Reset token
 * @returns Promise<void>
 */
export const sendPasswordResetEmail = async (userEmail: string, resetToken: string): Promise<void> => {
  try {
    const template = emailTemplates.passwordReset({
      firstName: userEmail.split('@')[0], // Use email prefix as name
      resetUrl: `${process.env['CLIENT_URL'] || 'https://pawfectmatch.com'}/reset-password?token=${resetToken}`,
    });

    await sendEmail(userEmail, template.subject, template.html);
  } catch (error) {
    logger.error('Error sending password reset email:', { error, userEmail });
    throw error;
  }
};

/**
 * Send match notification email
 * @param userEmail - User email
 * @param matchData - Match data
 * @returns Promise<void>
 */
export const sendMatchNotificationEmail = async (userEmail: string, matchData: MatchNotificationData): Promise<void> => {
  try {
    const template = emailTemplates.matchNotification({
      firstName: matchData.userName || userEmail.split('@')[0],
      matchedPetName: matchData.matchedPetName,
      yourPetName: matchData.yourPetName,
      matchUrl: `${process.env['CLIENT_URL'] || 'https://pawfectmatch.com'}/matches/${matchData.matchId}`,
    });

    await sendEmail(userEmail, template.subject, template.html);
  } catch (error) {
    logger.error('Error sending match notification email:', { error, userEmail, matchData });
    throw error;
  }
};

/**
 * Send custom email
 * @param to - Recipient email
 * @param subject - Email subject
 * @param content - Email content
 * @param isHtml - Whether content is HTML
 * @returns Promise<void>
 */
export const sendCustomEmail = async (to: string, subject: string, content: string, isHtml: boolean = true): Promise<void> => {
  try {
    if (isHtml) {
      await sendEmail(to, subject, content);
    } else {
      await sendEmail(to, subject, `<p>${content}</p>`, content);
    }
  } catch (error) {
    logger.error('Error sending custom email:', { error, to, subject });
    throw error;
  }
};

/**
 * Send bulk emails
 * @param recipients - Array of recipient emails
 * @param subject - Email subject
 * @param content - Email content
 * @param isHtml - Whether content is HTML
 * @returns Promise<void>
 */
export const sendBulkEmails = async (recipients: string[], subject: string, content: string, isHtml: boolean = true): Promise<void> => {
  try {
    const promises = recipients.map(email => 
      sendCustomEmail(email, subject, content, isHtml)
    );

    await Promise.allSettled(promises);
    
    logger.info('Bulk emails sent:', { 
      total: recipients.length, 
      subject 
    });
  } catch (error) {
    logger.error('Error sending bulk emails:', { error, recipients: recipients.length, subject });
    throw error;
  }
};

/**
 * Test email configuration
 * @returns Promise<boolean>
 */
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email configuration test successful');
    return true;
  } catch (error) {
    logger.error('Email configuration test failed:', { error });
    return false;
  }
};

// Export the service interface
const emailService: EmailService = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMatchNotificationEmail,
};

export default emailService;
