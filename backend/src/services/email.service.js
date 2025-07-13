import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_APP_PASSWORD,
  },
});

export const sendVerificationEmail = async (to, verificationLink) => {
  const mailOptions = {
    from: `"Monsan Brew" <${ENV.EMAIL_USER}>`,
    to,
    subject: 'Verify your email',
    html: `
        <body style="background: #f4f4f4; padding: 40px 0; font-family: 'Segoe UI', 'Arial', sans-serif;">
          <div style="max-width: 420px; margin: 0 auto; background: #fff; border-radius: 18px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); padding: 32px 28px; text-align: center;">
            <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5em; color: #222; letter-spacing: -1px;">
              Welcome to Monsan Brew <span style='font-size:1.5rem;'>👋</span>
            </h2>
            <p style="color: #555; font-size: 1.1rem; margin-bottom: 2em;">Thank you for signing up! Please verify your email to get started.</p>
            <a href="${verificationLink}" style="display: inline-block; background: #FFC107; color: #222; font-weight: 600; padding: 14px 0; width: 100%; border-radius: 8px; text-decoration: none; font-size: 1.1rem; margin-bottom: 1.5em; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">Verify Email</a>
            <p style="color: #888; font-size: 0.95rem; margin-top: 2em;">If you did not sign up for this account, you can safely ignore this email.</p>
          </div>
        </body>
        `
  };
  await transporter.sendMail(mailOptions);
};

export const sendResetPasswordEmail = async (to, resetLink) => {
  const mailOptions = {
    from: `"Monsan Brew" <${ENV.EMAIL_USER}>`,
    to,
    subject: 'Reset your password',
    html: `
        <body style="background: #f4f4f4; padding: 40px 0; font-family: 'Segoe UI', 'Arial', sans-serif;">
          <div style="max-width: 420px; margin: 0 auto; background: #fff; border-radius: 18px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); padding: 32px 28px; text-align: center;">
            <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5em; color: #222; letter-spacing: -1px;">
              Reset Your Password <span style='font-size:1.5rem;'>🔒</span>
            </h2>
            <p style="color: #555; font-size: 1.1rem; margin-bottom: 2em;">We received a request to reset your password. Click the button below to set a new password.</p>
            <p style="color: #555; font-size: 1.1rem; margin-bottom: 2em;">This link will expire in 1 hour.</p>
            <a href="${resetLink}" style="display: inline-block; background: #FFC107; color: #222; font-weight: 600; padding: 14px 0; width: 100%; border-radius: 8px; text-decoration: none; font-size: 1.1rem; margin-bottom: 1.5em; box-shadow: 0 1px 4px rgba(0,0,0,0.04);">Reset Password</a>
            <p style="color: #888; font-size: 0.95rem; margin-top: 2em;">If you did not request a password reset, you can safely ignore this email.</p>
          </div>
        </body>
        `
  };
  await transporter.sendMail(mailOptions);
};

export const sendWelcomeWithPasswordEmail = async (to, password) => {
  const mailOptions = {
    from: `"Monsan Brew" <${ENV.EMAIL_USER}>`,
    to,
    subject: 'Your Monsan Brew Account Password',
    html: `
        <body style="background: #f4f4f4; padding: 40px 0; font-family: 'Segoe UI', 'Arial', sans-serif;">
          <div style="max-width: 420px; margin: 0 auto; background: #fff; border-radius: 18px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); padding: 32px 28px; text-align: center;">
            <h2 style="font-size: 2rem; font-weight: 700; margin-bottom: 0.5em; color: #222; letter-spacing: -1px;">
              Welcome to Monsan Brew <span style='font-size:1.5rem;'>👋</span>
            </h2>
            <p style="color: #555; font-size: 1.1rem; margin-bottom: 2em;">Your account has been created by the admin. Here is your temporary password:</p>
            <div style="font-size: 1.5rem; font-weight: bold; color: #222; background: #FFC107; padding: 12px 0; border-radius: 8px; margin-bottom: 2em; letter-spacing: 2px;">${password}</div>
            <p style="color: #555; font-size: 1.1rem; margin-bottom: 2em;"><strong>Important:</strong> You will be required to change this password on your first login for security purposes.</p>
            <p style="color: #888; font-size: 0.95rem; margin-top: 2em;">If you did not expect this email, you can safely ignore it.</p>
          </div>
        </body>
        `
  };
  await transporter.sendMail(mailOptions);
};
