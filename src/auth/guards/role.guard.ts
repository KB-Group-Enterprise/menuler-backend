import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Admin, Role } from '@prisma/client';
import { ROLE_LIST } from '../enums/role-list.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles =
      this.reflector.get<string[]>('roles', context.getHandler()) || [];
    const hasRole = roles && roles.length > 0;
    if (!hasRole) return false;

    const request = context.switchToHttp().getRequest();
    const admin = request.user as Admin & { role: Role };
    if (admin.role.key === ROLE_LIST.ROOT) return true;
    const isAdminHasRole = roles.includes(admin.role.key);
    return isAdminHasRole;
  }
}
