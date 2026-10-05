import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import {
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RegisterDto,
} from '../dto/auth.dto';
import { CurrentUser, Public } from '@/common/decorators/permissions.decorator';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { AuthUserPayload } from '../services/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User registration' })
  @ApiCreatedResponse({ description: 'Account created and an authenticated session returned.' })
  @ApiBadRequestResponse({ description: 'The account already exists or the request is invalid.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sign in and receive an access token',
    description: 'After seeding development data, use admin@unicore.edu with the configured DEMO_PASSWORD.',
  })
  @ApiOkResponse({
    description: 'Authenticated session, role, permissions, access token, and refresh token.',
    schema: {
      example: {
        success: true,
        message: 'Operation successful',
        data: {
          accessToken: '<jwt-access-token>',
          refreshToken: '<refresh-token>',
          expiresIn: '15m',
          sessionId: '<session-id>',
          user: {
            id: '<user-id>',
            email: 'admin@unicore.edu',
            firstName: 'Amelia',
            lastName: 'Stone',
            userType: 'ADMINISTRATOR',
          },
          roles: ['ADMIN'],
          permissions: ['dashboard.admin.read', 'academic.read', 'academic.manage'],
        },
        timestamp: '2026-10-05T10:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials or inactive account.' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req.ip || '', req.headers['user-agent']);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({ description: 'A rotated access-token and refresh-token pair.' })
  @ApiUnauthorizedResponse({ description: 'Refresh token is invalid, expired, or revoked.' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'User logout' })
  @ApiOkResponse({ description: 'Refresh token revoked and session closed.' })
  logout(@Body() dto: RefreshTokenDto & { sessionId?: string }) {
    return this.authService.logout(dto.refreshToken, dto.sessionId);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiOkResponse({ description: 'Generic password-reset response returned.' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiOkResponse({ description: 'Password changed and existing tokens revoked.' })
  @ApiBadRequestResponse({ description: 'Reset token is invalid or expired.' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List active sessions' })
  @ApiOkResponse({ description: 'Active sessions for the current account.' })
  getSessions(@CurrentUser() user: AuthUserPayload) {
    return this.authService.getActiveSessions(user.sub);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'Current account profile, roles, and permissions.' })
  getMe(@CurrentUser() user: AuthUserPayload) {
    return this.authService.getProfile(user.sub);
  }
}
