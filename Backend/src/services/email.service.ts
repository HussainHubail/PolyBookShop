// FILE: src/services/email.service.ts
// Email service using Nodemailer - handles all email notifications

import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import prisma from '../config/database';
import { logger, LogAction } from '../utils/logger';

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Send email verification link to new member
   * PERSISTENCE: Creates NOTIFICATION record
   */
  async sendVerificationEmail(
    email: string,
    username: string,
    loginId: string,
    verificationToken: string,
    userId: number
  ): Promise<void> {
    const verificationLink = `${env.FRONTEND_URL}/auth/verify?token=${verificationToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .login-id { background: #fbbf24; color: #92400e; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Welcome to PolyBookShop!</h1>
          </div>
          <div class="content">
            <h2>Hello ${username},</h2>
            <p>Thank you for signing up with PolyBookShop University Library Management System.</p>
            
            <p><strong>Your Member Login ID:</strong></p>
            <div class="login-id">${loginId}</div>
            <p style="color: #dc2626;"><strong>⚠️ Important:</strong> Save this ID! You'll need it to log in.</p>
            
            <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #3b82f6;">${verificationLink}</p>
            
            <p>This verification link will expire in ${env.VERIFICATION_TOKEN_EXPIRY_HOURS} hours.</p>
            
            <p>If you didn't create an account with PolyBookShop, please ignore this email.</p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} PolyBookShop - University Library Management System</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: '📚 PolyBookShop - Verify Your Email Address',
        html: htmlContent,
      });

      // PERSISTENCE: Create notification record
      await prisma.notification.create({
        data: {
          userId,
          type: 'EMAIL_VERIFICATION',
          channel: 'email',
          title: 'Email Verification',
          message: `Please verify your email address for PolyBookShop account`,
          payload: JSON.stringify({
            loginId,
            verificationLink,
            expiresIn: `${env.VERIFICATION_TOKEN_EXPIRY_HOURS} hours`,
          }),
          status: 'sent',
        },
      });

      logger.info(LogAction.SEND_NOTIFICATION, {
        type: 'EMAIL_VERIFICATION',
        email,
        userId,
      });
    } catch (error) {
      // PERSISTENCE: Log failure
      await prisma.notification.create({
        data: {
          userId,
          type: 'EMAIL_VERIFICATION',
          channel: 'email',
          title: 'Email Verification',
          message: 'Failed to send verification email',
          payload: JSON.stringify({ loginId, error: (error as Error).message }),
          status: 'failed',
        },
      });

      throw new Error(`Failed to send verification email: ${(error as Error).message}`);
    }
  }

  /**
   * Send loan confirmation email with borrow and return dates
   * PERSISTENCE: Creates NOTIFICATION record
   */
  async sendLoanConfirmationEmail(
    email: string,
    username: string,
    loanDetails: {
      bookTitle: string;
      author: string;
      barcode: string;
      borrowDate: Date;
      dueDate: Date;
      loanId: number;
    },
    userId: number
  ): Promise<void> {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(date);
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .book-info { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 5px; }
          .date-box { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .warning { background: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; color: #6b7280; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📖 Loan Confirmation</h1>
          </div>
          <div class="content">
            <h2>Hello ${username},</h2>
            <p>Your book loan has been successfully processed! Here are the details:</p>
            
            <div class="book-info">
              <h3 style="margin-top: 0; color: #1e3a8a;">📚 ${loanDetails.bookTitle}</h3>
              <p><strong>Author:</strong> ${loanDetails.author}</p>
              <p><strong>Barcode:</strong> ${loanDetails.barcode}</p>
            </div>
            
            <div class="date-box">
              <p style="margin: 5px 0;"><strong>🗓️ Borrow Date:</strong></p>
              <p style="margin: 5px 0; font-size: 16px; color: #059669;">${formatDate(loanDetails.borrowDate)}</p>
            </div>
            
            <div class="date-box">
              <p style="margin: 5px 0;"><strong>📅 Return Due Date:</strong></p>
              <p style="margin: 5px 0; font-size: 16px; color: #dc2626;">${formatDate(loanDetails.dueDate)}</p>
            </div>
            
            <div class="warning">
              <p style="margin: 0;"><strong>⚠️ Important:</strong> Please return the book by the due date to avoid late fees of $${env.FINE_PER_DAY} per day.</p>
            </div>
            
            <p>Thank you for using PolyBookShop!</p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} PolyBookShop - University Library Management System</p>
              <p>Loan ID: #${loanDetails.loanId}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: `📖 Loan Confirmed: ${loanDetails.bookTitle}`,
        html: htmlContent,
      });

      // PERSISTENCE: Create notification record
      await prisma.notification.create({
        data: {
          userId,
          type: 'LOAN_CONFIRMATION',
          channel: 'email',
          title: `Loan Confirmed: ${loanDetails.bookTitle}`,
          message: `Your loan has been confirmed. Due date: ${loanDetails.dueDate}`,
          payload: JSON.stringify({
            loanId: loanDetails.loanId,
            bookTitle: loanDetails.bookTitle,
            borrowDate: loanDetails.borrowDate,
            dueDate: loanDetails.dueDate,
          }),
          status: 'sent',
        },
      });

      logger.info(LogAction.SEND_NOTIFICATION, {
        type: 'LOAN_CONFIRMATION',
        email,
        loanId: loanDetails.loanId,
      });
    } catch (error) {
      // PERSISTENCE: Log failure
      await prisma.notification.create({
        data: {
          userId,
          type: 'LOAN_CONFIRMATION',
          channel: 'email',
          title: 'Loan Confirmation',
          message: 'Failed to send loan confirmation email',
          payload: JSON.stringify({ loanId: loanDetails.loanId, error: (error as Error).message }),
          status: 'failed',
        },
      });

      throw new Error(`Failed to send loan confirmation email: ${(error as Error).message}`);
    }
  }

  /**
   * Send due date reminder
   */
  async sendDueReminderEmail(
    email: string,
    username: string,
    loanDetails: {
      bookTitle: string;
      dueDate: Date;
      loanId: number;
    },
    userId: number
  ): Promise<void> {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(date);
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">⏰ Book Due Date Reminder</h2>
          <p>Hello ${username},</p>
          <p>This is a friendly reminder that the following book is due soon:</p>
          <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>📚 Book:</strong> ${loanDetails.bookTitle}</p>
            <p><strong>📅 Due Date:</strong> ${formatDate(loanDetails.dueDate)}</p>
          </div>
          <p>Please return it on time to avoid late fees.</p>
          <p>Thank you!</p>
          <p style="color: #6b7280; font-size: 12px;">Loan ID: #${loanDetails.loanId}</p>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to: email,
        subject: `⏰ Reminder: "${loanDetails.bookTitle}" Due Soon`,
        html: htmlContent,
      });

      await prisma.notification.create({
        data: {
          userId,
          type: 'DUE_REMINDER',
          channel: 'email',
          title: `Reminder: "${loanDetails.bookTitle}" Due Soon`,
          message: `Your loan is due on ${loanDetails.dueDate}`,
          payload: JSON.stringify(loanDetails),
          status: 'sent',
        },
      });
    } catch (error) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'DUE_REMINDER',
          channel: 'email',
          title: 'Due Reminder',
          message: 'Failed to send due date reminder',
          payload: JSON.stringify({ ...loanDetails, error: (error as Error).message }),
          status: 'failed',
        },
      });
    }
  }
}

export default new EmailService();
