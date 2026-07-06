import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { AuthRepository } from '../repositories/auth.repository';
import { SessionStoreService } from '@/infrastructure/redis/session-store.service';
import {
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  RegisterDto,
} from '../dto/auth.dto';
import { UserType } from '@prisma/client';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  sessionId: string;
}

export interface AuthUserPayload {
  sub: string;
  email: string;
  permissions: string[];
  roles: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly sessionStore: SessionStoreService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPair> {
    const existing = await this.authRepo.findUserByEmail(dto.email);
    if (existing) throw new BadRequestException('User already exists');

    const [firstName, ...lastNames] = dto.fullName.split(' ');
    const lastName = lastNames.join(' ') || 'User';

    const passwordHash = await this.authRepo.hashPassword(dto.password);

    const user = await this.authRepo.createUser({
      email: dto.email,
      username: dto.username || dto.email.split('@')[0] + uuidv4().slice(0, 4),
      passwordHash,
      firstName,
      lastName,
      userType: (dto.role?.toUpperCase() as UserType) || UserType.STUDENT,
    });

    if (dto.role) {
      const role = await this.authRepo.findRoleBySlug(dto.role.toLowerCase());
      if (role) {
        await this.authRepo.assignRoleToUser(user.id, role.id);
      }
    }

    return this.issueTokens(user);
  }

  async getProfile(userId: string) {
    const user = await this.authRepo.findUserById(userId);
    if (!user) throw new UnauthorizedException();

    const permissions = await this.authRepo.getUserPermissions(userId);
    const roles = await this.authRepo.getUserRoles(userId);

    const { passwordHash, ...profile } = user;
    return {
      ...profile,
      permissions,
      roles,
    };
  }

  async login(dto: LoginDto, ip: string, userAgent?: string): Promise<TokenPair> {
    const user = await this.authRepo.findUserByEmail(dto.email);

    if (!user) {
      await this.authRepo.createLoginHistory({
        userId: '00000000-0000-0000-0000-000000000000',
        ipAddress: ip,
        userAgent,
        success: false,
        failReason: 'User not found',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.authRepo.comparePassword(dto.password, user.passwordHash);
    if (!valid) {
      await this.authRepo.createLoginHistory({
        userId: user.id,
        ipAddress: ip,
        userAgent,
        success: false,
        failReason: 'Invalid password',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('Account suspended');
    }

    const tokens = await this.issueTokens(user, ip, userAgent);
    await this.authRepo.updateLastLogin(user.id, ip);
    await this.authRepo.createLoginHistory({
      userId: user.id,
      ipAddress: ip,
      userAgent,
      success: true,
    });

    return tokens;
  }

  async refresh(dto: RefreshTokenDto): Promise<TokenPair> {
    const stored = await this.authRepo.findRefreshToken(dto.refreshToken);
    if (!stored) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.authRepo.findUserById(stored.userId);
    if (!user) throw new UnauthorizedException('User not found');

    await this.authRepo.revokeRefreshToken(dto.refreshToken);
    return this.issueTokens(user);
  }

  async logout(refreshToken: string, sessionId?: string): Promise<void> {
    await this.authRepo.revokeRefreshToken(refreshToken);
    if (sessionId) {
      await this.sessionStore.destroy(sessionId);
      await this.authRepo.deactivateSession(sessionId);
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.authRepo.findUserByEmail(dto.email);
    if (!user) return { message: 'If the email exists, a reset link has been sent' };

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000);
    await this.authRepo.createPasswordReset({
      userId: user.id,
      token,
      expiresAt,
    });

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const reset = await this.authRepo.findPasswordReset(dto.token);
    if (!reset) throw new BadRequestException('Invalid or expired reset token');

    const hash = await this.authRepo.hashPassword(dto.newPassword);
    await this.authRepo.updatePassword(reset.userId, hash);
    await this.authRepo.markPasswordResetUsed(reset.id);
    await this.authRepo.revokeAllUserTokens(reset.userId);

    return { message: 'Password reset successfully' };
  }

  private async issueTokens(
    user: {
      id: string;
      email: string;
    },
    ip?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    const permissions = await this.authRepo.getUserPermissions(user.id);
    const roles = await this.authRepo.getUserRoles(user.id);

    const payload: AuthUserPayload = {
      sub: user.id,
      email: user.email,
      permissions,
      roles,
    };

    const accessExpiresIn = this.config.get<string>('jwt.accessExpiresIn', '15m');
    const refreshExpiresIn = this.config.get<string>('jwt.refreshExpiresIn', '7d');

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: accessExpiresIn,
    });

    const refreshToken = uuidv4();
    const refreshExpiry = this.parseExpiry(refreshExpiresIn);

    await this.authRepo.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpiry,
      ipAddress: ip,
      userAgent,
    });

    const sessionId = uuidv4();
    const sessionExpiry = this.parseExpiry(refreshExpiresIn);

    await this.authRepo.createSession({
      userId: user.id,
      sessionId,
      expiresAt: sessionExpiry,
      ipAddress: ip,
      userAgent,
    });

    await this.sessionStore.create(sessionId, {
      userId: user.id,
      ipAddress: ip,
      userAgent,
      createdAt: new Date().toISOString(),
    } as any);

    return { accessToken, refreshToken, expiresIn: accessExpiresIn, sessionId };
  }

  private parseExpiry(exp: string): Date {
    const match = exp.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(Date.now() + 7 * 86400000);
    const [, num, unit] = match;
    const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return new Date(Date.now() + parseInt(num) * multipliers[unit]);
  }
}
