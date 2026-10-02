import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { UserStatus, UserType } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.users.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async findUserById(id: string) {
    return this.prisma.users.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async createUser(data: {
    email: string;
    username: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    userType: UserType;
  }) {
    return this.prisma.users.create({
      data: { ...data, status: UserStatus.ACTIVE },
    });
  }

  async findRoleBySlug(slug: string) {
    return this.prisma.roles.findFirst({
      where: { slug },
    });
  }

  async assignRoleToUser(userId: string, roleId: string) {
    return this.prisma.userRoles.create({
      data: { userId, roleId },
    });
  }

  async createRefreshToken(data: {
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.refreshTokens.create({
      data: { ...data, token: this.hashToken(data.token) },
    });
  }

  async findRefreshToken(token: string) {
    return this.prisma.refreshTokens.findFirst({
      where: { token: this.hashToken(token), revoked: false, expiresAt: { gt: new Date() } },
    });
  }

  async revokeRefreshToken(token: string) {
    return this.prisma.refreshTokens.updateMany({
      where: { token: this.hashToken(token) },
      data: { revoked: true, revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string) {
    return this.prisma.refreshTokens.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });
  }

  async createLoginHistory(data: {
    userId: string;
    ipAddress: string;
    userAgent?: string;
    device?: string;
    success: boolean;
    failReason?: string;
  }) {
    return this.prisma.loginHistory.create({ data });
  }

  async createSession(data: {
    userId: string;
    sessionId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    device?: string;
  }) {
    return this.prisma.sessions.create({ data });
  }

  async deactivateSession(sessionId: string) {
    return this.prisma.sessions.updateMany({
      where: { sessionId },
      data: { isActive: false },
    });
  }

  async createPasswordReset(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }) {
    return this.prisma.passwordResets.create({
      data: { ...data, token: this.hashToken(data.token) },
    });
  }

  async findPasswordReset(token: string) {
    return this.prisma.passwordResets.findFirst({
      where: { token: this.hashToken(token), usedAt: null, expiresAt: { gt: new Date() } },
    });
  }

  async markPasswordResetUsed(id: string) {
    return this.prisma.passwordResets.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return this.prisma.users.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRoles.findMany({
      where: { userId },
      select: { roleId: true },
    });
    const roleIds = userRoles.map((r) => r.roleId);

    const rolePermRows = roleIds.length
      ? await this.prisma.rolePermissions.findMany({
          where: { roleId: { in: roleIds } },
          select: { permissionId: true },
        })
      : [];

    const permIds = new Set(rolePermRows.map((r) => r.permissionId));

    const directPermRows = await this.prisma.userPermissions.findMany({
      where: { userId, granted: true },
      select: { permissionId: true },
    });
    directPermRows.forEach((d) => permIds.add(d.permissionId));

    if (!permIds.size) return [];

    const permissions = await this.prisma.permissions.findMany({
      where: { id: { in: Array.from(permIds) } },
      select: { slug: true },
    });
    return permissions.map((p) => p.slug);
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const userRoleRows = await this.prisma.userRoles.findMany({
      where: { userId },
      select: { roleId: true },
    });
    if (!userRoleRows.length) return [];

    const roles = await this.prisma.roles.findMany({
      where: { id: { in: userRoleRows.map((r) => r.roleId) } },
      select: { slug: true },
    });
    return roles.map((r) => r.slug);
  }

  async findActiveSessions(userId: string) {
    return this.prisma.sessions.findMany({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      select: {
        sessionId: true,
        ipAddress: true,
        userAgent: true,
        device: true,
        lastActivity: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { lastActivity: 'desc' },
    });
  }

  async updateLastLogin(userId: string, ip: string) {
    return this.prisma.users.update({
      where: { id: userId },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
