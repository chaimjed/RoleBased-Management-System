import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Check your email address',
      html: `
<p>Hello,</p>
<p>Thank you for registering. Click the link below to verify your email:</p>
<a href="${verifyUrl}">${verifyUrl}</a>
<p>This link expires in 24 hours.</p>
      `,
    });
  }
  async sendResetPasswordEmail(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password',
      html: `
     <p>Hello,</p>
<p>You have requested a password reset. Click the link below:</p>
<a href="${resetUrl}">${resetUrl}</a>
<p>This link expires in 1 hour. If you did not request this, please ignore this email.</p>
    `,
    });
  }
  async sendAccountStatusEmail(
    email: string,
    firstName: string,
    status: 'SUSPENDED' | 'BANNED',
    reason: string,
    suspendedUntil?: Date,
  ) {
    const actionText = status === 'SUSPENDED' ? 'suspended' : 'banned';

    const durationLine =
      status === 'SUSPENDED' && suspendedUntil
        ? `\n\nYour suspension will be lifted on ${suspendedUntil.toLocaleDateString(
            'en-US',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            },
          )}.`
        : '';

    await this.mailerService.sendMail({
      to: email,
      subject: `Your account has been ${actionText}`,
      text: `Hello ${firstName},\n\nYour account has been ${actionText} for the following reason:\n\n${reason}${durationLine}`,
    });
  }
}
