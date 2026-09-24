import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@oriental/types';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Akses ditolak: Identitas pengguna tidak valid');
    }

    // Role Hierarchy Checking:
    // SUPER_ADMIN has access to everything
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Strict Isolation: ADMIN_KASIR can never access manager/owner endpoints
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Akses ditolak: Peran ${user.role} tidak memiliki otorisasi untuk mengakses fitur ini`,
      );
    }

    return true;
  }
}
