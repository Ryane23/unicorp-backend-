import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantId =
      request.headers['x-tenant-id'] ||
      request.user?.tenantId ||
      request.query?.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required (x-tenant-id header)');
    }
    request.tenantId = tenantId;
    return true;
  }
}
