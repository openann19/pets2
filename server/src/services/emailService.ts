export {};// Added to mark file as a module
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
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

// Email templates
const emailTemplates = {
  emailVerification: (data) => ({
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

  passwordReset: (data) => ({
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

  newMatch: (data) => ({
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

  premiumWelcome: (data) => ({
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
};

/**
 * Send email using configured template
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.template - Template name
 * @param {Object} options.data - Template data
 * @returns {Promise} Email sending promise
 */
const sendEmail = async ({ email, template, data }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('Email service not configured. Skipping email send.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    const templateFunc = emailTemplates[template];
    
    if (!templateFunc) {
      throw new Error(`Email template '${template}' not found`);
    }

    const { subject, html } = templateFunc(data);

    const mailOptions = {
      from: {
        name: 'PawfectMatch',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully', { messageId: result.messageId, to: email });
    return { success: true, messageId: result.messageId };

  } catch (error) {
    logger.error('Email sending error:', { error });
    throw error;
  }
};

/**
 * Send bulk emails (for newsletters, announcements)
 * @param {Array} recipients - Array of recipient objects
 * @param {string} template - Template name
 * @param {Object} commonData - Common data for all recipients
 * @returns {Promise<Array>} Results array
 */
const sendBulkEmails = async (recipients, template, commonData = {}) => {
  const results = [];
  
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
      logger.error('Failed to send email', { email: recipient.email, error });
      results.push({ email: recipient.email, success: false, error: error.message });
    }
  }
  
  return results;
};

/**
 * Send notification email
 * @param {string} email - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Email message
 * @returns {Promise} Email sending promise
 */
const sendNotificationEmail = async (email, subject, message) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'PawfectMatch',
        address: process.env.EMAIL_USER
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

module.exports = {
  sendEmail,
  sendBulkEmails,
  sendNotificationEmail
};