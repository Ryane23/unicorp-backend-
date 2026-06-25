import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const Public = () => SetMetadata('isPublic', true);

export const CurrentUser = () => {
  return (target: object, key: string | symbol, index: number) => {
    // Parameter decorator placeholder - use @Req() req and req.user in controllers
  };
};
