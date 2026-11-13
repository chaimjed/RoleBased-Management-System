import {
  Body,
  Controller,
  Post,
  Patch,
  Query,
  Get,
  UseGuards,
  Request,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/Signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { Response } from 'express';
import { SetPasswordDto } from './dto/set-password.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
 
 @Post('setPassword')
 @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Set a password for a Google-only account' })
  @ApiResponse({ status: 200, description: 'Password successful set' })
  @ApiResponse({
    status: 400,
    description: 'Password already set or mismatch',
  })
  SetPassword(@Request() req, @Body() dto:SetPasswordDto){
return this.authService.setPassword(req.user.id,dto)
  }
 
 @Get('google')
@UseGuards(GoogleAuthGuard)
@ApiOperation({ summary: 'Redirect to Google OAuth consent screen' })
async googleAuth() {
  
}

@Get('google/callback')
@UseGuards(GoogleAuthGuard)
async googleAuthCallback(@Request() req, @Res() res: Response) {
  const tokens = await this.authService.validateOAuthLogin(req.user);
  const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
  res.redirect(redirectUrl);
}
 
  @Post('login')
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @ApiOperation({ summary: 'Log in and retrieve access + refresh token' })
  @ApiResponse({ status: 200, description: 'Connection successful' })
  @ApiResponse({
    status: 401,
    description: 'Invalid login details or unverified email',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Retrieve the profile of the logged-in user" })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Invalid or missing token' })
getProfile(@Request() req) {
    const {
      password,
      refreshToken,
      verificationToken,
      resetToken,
      role,
      permissions,
      ...user
    } = req.user;
    return {
      ...user,
      hasPassword: !!password,
      role: role?.name,
      permissions,
    };
  }
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile successfully updated' })
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, dto);
  }
  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Regenerate an access token from the refresh token',
  })
  @ApiResponse({ status: 200, description: 'New tokens generated' })
  @ApiResponse({ status: 401, description: 'Refresh token is invalid or expired' })
  refreshTokens(@Request() req) {
    return this.authService.refreshTokens(req.user.id, req.user.email);
  }
  @Post('signup')
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({ status: 201, description: 'Account successfully created' })
  @ApiResponse({ status: 409, description: 'Email address already used' })
  @ApiResponse({
    status: 400,
    description: 'Incompatible passwords or invalid data',
  })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Get('verify-email')
  @ApiOperation({
    summary: "Verify the email address using the token received by email.",
  })
  @ApiResponse({ status: 200, description: 'Email vérifié avec succès' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset' })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent if the account exists',
  })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset your password using the token received by email',
  })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token, expired token, or non-identical passwords',
  })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password (logged-in user)' })
  @ApiResponse({ status: 200, description: 'Password successfully changed' })
  @ApiResponse({
    status: 400,
    description:
      'Current password incorrect or new passwords do not match',
  })
  @ApiResponse({ status: 401, description: 'Invalid or missing token' })
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto);
  }
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out (invalidates the refresh token)' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Invalid or missing token' })
  logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }
  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Upload the user's avatar" })
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${uniqueName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(
            new BadRequestException(
              'Only JPG, PNG, and WEBP formats are accepted.',
            ),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 6 * 1024 * 1024 }, // 6
    }),
  )
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const avatarUrl = `/uploads/${file.filename}`;
    return this.authService.updateAvatar(req.user.id, avatarUrl);
  }
}
