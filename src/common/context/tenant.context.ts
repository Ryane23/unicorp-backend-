import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
  tenantId!: string;
  userId?: string;
  institutionId?: string;
  campusId?: string;
  permissions: string[] = [];
  roles: string[] = [];

  setTenant(tenantId: string) {
    this.tenantId = tenantId;
  }

  setUser(userId: string, permissions: string[] = [], roles: string[] = []) {
    this.userId = userId;
    this.permissions = permissions;
    this.roles = roles;
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission) || this.permissions.includes('*');
  }
}
