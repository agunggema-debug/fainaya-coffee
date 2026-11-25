import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (UserRole | keyof typeof UserRole | string)[]) =>
  SetMetadata(ROLES_KEY, roles);
