import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const Public = () => SetMetadata('isPublic', true);

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => context.switchToHttp().getRequest().user,
);
