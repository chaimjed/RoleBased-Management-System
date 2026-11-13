import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDto } from './dto/Signup.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private jwtService: JwtService,
    private auditLogService: AuditLogService,

  ) {}

  async signup(dto: SignupDto) {
    const dob = new Date(dto.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 12) {
      throw new BadRequestException(
        'You must be at least 12 years old to register',
      );
    }

    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('The passwords do not match');
    }
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException(
        'An account already exists with this email address.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: new Date(dto.dateOfBirth),
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
        verificationTokenExpiry,
        role: { connect: { name: 'USER' } },
      },
    });

    await this.mailService.sendVerificationEmail(user.email, verificationToken);

     const {
    password, resetToken, resetTokenExpiry, verificationToken: vt, ...result
  } = user;

  return {
    message: `We've sent a verification email to ${user.email}. Please check your inbox and click the link to verify your account before logging in.`,
    user: result,
  };
}

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }

    if (
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry < new Date()
    ) {
      throw new BadRequestException('The verification link has expired.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return { message: 'Email successfully verified' };
  }
  async resendVerificationLinkByUserId(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (user.isVerified) {
      throw new BadRequestException('This email is already verified.');
    }

    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: { verificationToken, verificationTokenExpiry },
    });

    await this.mailService.sendVerificationEmail(user.email, verificationToken);
  }

   async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      await this.auditLogService.log({
        key: 'LOGIN_FAILED',
        metadata: { email: dto.email, reason: 'no_such_user' },
      });
      throw new UnauthorizedException('Incorrect email or password');
    }
    if (!user.password) {
      throw new BadRequestException(
        'This account uses Google sign in and has no password to change. Use "Set password" instead.',
      );
    }
    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      await this.auditLogService.log({
        actorId: user.id,
        key: 'LOGIN_FAILED',
        metadata: { reason: 'wrong_password' },
      });
      throw new UnauthorizedException('Incorrect email or password');
    }
    if (user.status !== 'ACTIVE') {
      const reason = user.status === 'BANNED' ? 'banned' : 'suspended';
      await this.auditLogService.log({
        actorId: user.id,
        key: 'LOGIN_BLOCKED',
        metadata: { reason: user.status },
      });
      throw new UnauthorizedException(
        `Your account has been ${reason}. Contact support.`,
      );
    }
    if (!user.isVerified) {
  throw new UnauthorizedException(
    'Your email is not verified yet. Please check your inbox for the verification link before logging in.',
  );
}

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    await this.auditLogService.log({ actorId: user.id, key: 'LOGIN_SUCCESS' });

    return tokens;
  }
  async refreshTokens(userId: string, email: string) {
    const tokens = await this.generateTokens(userId, email);
    await this.updateRefreshToken(userId, tokens.refreshToken);
    return tokens;
  }
  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN_SECONDS) || 900, // 15
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn:
            Number(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS) || 604800, // 7
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
        ...(dto.phone && { phone: dto.phone }),
      },
    });

    const { password, refreshToken, verificationToken, resetToken, ...result } =
      user;
    return result;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      return { message: 'If this email exists,a reset link has been sent' };
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    await this.mailService.sendResetPasswordEmail(user.email, resetToken);

    return { message: 'If this email exists, a reset link has been sent' };
  }
  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    const { password, refreshToken, verificationToken, resetToken, ...result } =
      user;
    return result;
  }
  async resetPassword(dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('The passwords do not match');
    }

    const user = await this.prisma.user.findUnique({
      where: { resetToken: dto.token },
    });

    if (!user) {
      throw new BadRequestException('Token invalide');
    }

    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('The reset link has expired.');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        refreshToken: null,
      },
    });

    return { message: 'Password successfully reset' };
  }
  async changePassword(userId: string, dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('The new passwords do not match');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.password) {
      throw new BadRequestException(
        'This account uses Google sign in and has no password to change. Use "Set password" instead.',
      );
    }
    const currentPasswordMatches = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );
    if (!currentPasswordMatches) {
      throw new BadRequestException('Incorrect current password');
    }

    const samePassword = await bcrypt.compare(dto.newPassword, user.password);
    if (samePassword) {
      throw new BadRequestException(
        'The new password must be different from the current one',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        refreshToken: null,
      },
    });

    return { message: 'Password successfully changed' };
  }
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Logout successful' };
  }
  async validateOAuthLogin(googleUser: {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId: googleUser.googleId,
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          avatarUrl: googleUser.avatarUrl,
          dateOfBirth: new Date('2000-01-01'),
          isVerified: true,
          password: null,
          role: { connect: { name: 'USER' } },
        },
      });
    } else if (!user.googleId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleUser.googleId, isVerified: true },
      });
    }
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async setPassword(userId: string, dto: SetPasswordDto) {
    if (dto.newPassword !== dto.confirmNewPassword) {
      throw new BadRequestException('The passwords do not match');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.password) {
      throw new BadRequestException('a password is already set');
    }
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    return { message: 'Password successfully set' };
  }
}
