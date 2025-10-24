/**
 * Email Template System for PawfectMatch
 * Provides responsive HTML email templates with inline CSS
 */

const emailTemplates = {
  // Welcome email for new users
  welcome: (userData) => ({
    subject: 'Welcome to PawfectMatch! 🐾',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to PawfectMatch</title>
        <style>
          /* Reset styles */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 40px 20px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; border-radius: 0 0 10px 10px; }
          .highlight { background: #e3f2fd; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          @media (max-width: 600px) { .container { padding: 10px; } .header, .content, .footer { padding: 20px 15px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🐾 Welcome to PawfectMatch!</h1>
            <p>Find the perfect companion for your furry friend</p>
          </div>

          <div class="content">
            <h2>Hello ${userData.firstName}!</h2>
            <p>Thank you for joining PawfectMatch. We're excited to help you find the perfect matches for your pets!</p>

            <div class="highlight">
              <h3>🎯 What's Next?</h3>
              <ul>
                <li>Complete your profile</li>
                <li>Add your pet's information</li>
                <li>Start swiping to find matches</li>
                <li>Chat with potential matches</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">Get Started</a>
            </div>

            <p>If you have any questions, feel free to reply to this email or contact our support team.</p>

            <p>Happy matching!<br>The PawfectMatch Team</p>
          </div>

          <div class="footer">
            <p>&copy; 2024 PawfectMatch. All rights reserved.</p>
            <p>
              <a href="${process.env.CLIENT_URL}/privacy" style="color: #667eea;">Privacy Policy</a> |
              <a href="${process.env.CLIENT_URL}/terms" style="color: #667eea;">Terms of Service</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to PawfectMatch!

      Hello ${userData.firstName}!

      Thank you for joining PawfectMatch. We're excited to help you find the perfect matches for your pets!

      What's Next?
      - Complete your profile
      - Add your pet's information
      - Start swiping to find matches
      - Chat with potential matches

      Get started here: ${process.env.CLIENT_URL}/dashboard

      If you have any questions, feel free to reply to this email.

      Happy matching!
      The PawfectMatch Team
    `
  }),

  // Match notification email
  matchFound: (matchData) => ({
    subject: '🎉 You have a new match on PawfectMatch!',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Match Found!</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 40px 20px; }
          .match-card { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; border-radius: 0 0 10px 10px; }
          @media (max-width: 600px) { .container { padding: 10px; } .header, .content, .footer { padding: 20px 15px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Match Found!</h1>
            <p>Your pet has found a potential friend!</p>
          </div>

          <div class="content">
            <h2>Great news!</h2>
            <p><strong>${matchData.pet1Name}</strong> and <strong>${matchData.pet2Name}</strong> have matched!</p>

            <div class="match-card">
              <h3>Match Details</h3>
              <p><strong>Compatibility Score:</strong> ${matchData.compatibilityScore}%</p>
              <p><strong>Match Type:</strong> ${matchData.matchType}</p>
              <p><strong>Matched on:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/chat/${matchData.matchId}" class="button">Start Chatting</a>
            </div>

            <p>Don't forget to be respectful and follow our community guidelines when meeting new people and their pets.</p>
          </div>

          <div class="footer">
            <p>&copy; 2024 PawfectMatch. All rights reserved.</p>
            <p>Questions? <a href="mailto:support@pawfectmatch.com" style="color: #ff6b6b;">Contact Support</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      🎉 New Match Found!

      Great news! ${matchData.pet1Name} and ${matchData.pet2Name} have matched!

      Compatibility Score: ${matchData.compatibilityScore}%
      Match Type: ${matchData.matchType}

      Start chatting here: ${process.env.CLIENT_URL}/chat/${matchData.matchId}

      Remember to be respectful and follow our community guidelines!
    `
  }),

  // Password reset email
  passwordReset: (resetData) => ({
    subject: '🔐 Password Reset Request - PawfectMatch',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 40px 20px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; border-radius: 0 0 10px 10px; }
          @media (max-width: 600px) { .container { padding: 10px; } .header, .content, .footer { padding: 20px 15px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
            <p>Reset your PawfectMatch password</p>
          </div>

          <div class="content">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password for your PawfectMatch account.</p>

            <div class="warning">
              <strong>Security Note:</strong> This link will expire in 1 hour for your security.
            </div>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/reset-password?token=${resetData.token}" class="button">Reset Password</a>
            </div>

            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>

            <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${process.env.CLIENT_URL}/reset-password?token=${resetData.token}</p>
          </div>

          <div class="footer">
            <p>&copy; 2024 PawfectMatch. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Password Reset Request

      We received a request to reset your password for your PawfectMatch account.

      Reset your password here: ${process.env.CLIENT_URL}/reset-password?token=${resetData.token}

      Security Note: This link will expire in 1 hour.

      If you didn't request this password reset, please ignore this email.

      This is an automated message. Please do not reply to this email.
    `
  }),

  // Email verification
  emailVerification: (verificationData) => ({
    subject: '✅ Verify Your Email - PawfectMatch',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #26de81 0%, #20bf6b 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 40px 20px; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: linear-gradient(135deg, #26de81 0%, #20bf6b 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; border-radius: 0 0 10px 10px; }
          @media (max-width: 600px) { .container { padding: 10px; } .header, .content, .footer { padding: 20px 15px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Verify Your Email</h1>
            <p>One step closer to finding perfect matches!</p>
          </div>

          <div class="content">
            <h2>Almost there!</h2>
            <p>Please verify your email address to complete your PawfectMatch registration.</p>

            <div class="success">
              <strong>Why verify?</strong> Email verification helps us keep your account secure and ensures you receive important notifications about your matches.
            </div>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/verify-email?token=${verificationData.token}" class="button">Verify Email</a>
            </div>

            <p>If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${process.env.CLIENT_URL}/verify-email?token=${verificationData.token}</p>

            <p>This link will expire in 24 hours.</p>
          </div>

          <div class="footer">
            <p>&copy; 2024 PawfectMatch. All rights reserved.</p>
            <p>Need help? <a href="mailto:support@pawfectmatch.com" style="color: #26de81;">Contact Support</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Email Verification

      Please verify your email address to complete your PawfectMatch registration.

      Why verify? Email verification helps us keep your account secure and ensures you receive important notifications.

      Verify here: ${process.env.CLIENT_URL}/verify-email?token=${verificationData.token}

      This link will expire in 24 hours.

      Need help? Contact support@pawfectmatch.com
    `
  }),

  // Premium upgrade notification
  premiumUpgrade: (userData) => ({
    subject: '⭐ Welcome to PawfectMatch Premium!',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Premium Upgrade</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 40px 20px; }
          .premium-features { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .feature { display: flex; align-items: center; margin: 10px 0; }
          .feature-icon { color: #f093fb; margin-right: 10px; font-size: 18px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; border-radius: 0 0 10px 10px; }
          @media (max-width: 600px) { .container { padding: 10px; } .header, .content, .footer { padding: 20px 15px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⭐ Welcome to Premium!</h1>
            <p>Unlock unlimited possibilities for your pets</p>
          </div>

          <div class="content">
            <h2>Congratulations, ${userData.firstName}!</h2>
            <p>You've successfully upgraded to PawfectMatch Premium! Here are your new features:</p>

            <div class="premium-features">
              <h3>✨ Premium Features Unlocked:</h3>
              <div class="feature">
                <span class="feature-icon">❤️</span>
                <span>Unlimited likes and superlikes</span>
              </div>
              <div class="feature">
                <span class="feature-icon">👀</span>
                <span>See who liked your pets</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🔍</span>
                <span>Advanced filters and search options</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🚀</span>
                <span>Profile boost for better visibility</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🎯</span>
                <span>AI-powered premium recommendations</span>
              </div>
              <div class="feature">
                <span class="feature-icon">💬</span>
                <span>Priority customer support</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">Start Exploring</a>
            </div>

            <p>Thank you for choosing Premium! If you have any questions about your subscription, please don't hesitate to contact us.</p>
          </div>

          <div class="footer">
            <p>&copy; 2024 PawfectMatch. All rights reserved.</p>
            <p>Manage subscription: <a href="${process.env.CLIENT_URL}/premium" style="color: #f093fb;">Premium Settings</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to Premium!

      Congratulations, ${userData.firstName}! You've successfully upgraded to PawfectMatch Premium!

      Premium Features Unlocked:
      ❤️ Unlimited likes and superlikes
      👀 See who liked your pets
      🔍 Advanced filters and search options
      🚀 Profile boost for better visibility
      🎯 AI-powered premium recommendations
      💬 Priority customer support

      Start exploring: ${process.env.CLIENT_URL}/dashboard

      Thank you for choosing Premium!
    `
  })
};

// Email template utility functions
const emailUtils = {
  // Generate email options for nodemailer
  generateEmailOptions: (templateName, data) => {
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    return {
      from: process.env.EMAIL_FROM || 'noreply@pawfectmatch.com',
      to: data.email,
      subject: template(data).subject,
      html: template(data).html,
      text: template(data).text,
    };
  },

  // Preview email template (for development)
  previewTemplate: (templateName, data) => {
    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    return template(data);
  },

  // Validate email data
  validateEmailData: (templateName, data) => {
    const requiredFields = {
      welcome: ['firstName'],
      matchFound: ['pet1Name', 'pet2Name', 'compatibilityScore', 'matchId'],
      passwordReset: ['token'],
      emailVerification: ['token'],
      premiumUpgrade: ['firstName']
    };

    const required = requiredFields[templateName];
    if (!required) {
      throw new Error(`Unknown template: ${templateName}`);
    }

    for (const field of required) {
      if (!data[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return true;
  }
};

module.exports = {
  emailTemplates,
  emailUtils
};
