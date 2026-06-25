import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContext } from '@/common/context/tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantContext: TenantContext) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const tenantId =
      (req.headers['x-tenant-id'] as string) ||
      req.user?.tenantId;

    if (tenantId) {
      this.tenantContext.setTenant(tenantId);
      req.tenantId = tenantId;
    }

    if (req.user) {
      this.tenantContext.setUser(
        req.user.sub,
        req.user.permissions ?? [],
        req.user.roles ?? [],
      );
      this.tenantContext.institutionId = req.user.institutionId;
      this.tenantContext.campusId = req.user.campusId;
    }

    next();
  }
}

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      user?: {
        sub: string;
        email: string;
        tenantId: string;
        institutionId?: string;
        campusId?: string;
        permissions?: string[];
        roles?: string[];
      };
    }
  }
}
