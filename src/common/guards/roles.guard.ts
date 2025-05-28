import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    console.log(
      'RolesGuard DEBUG: Required Roles from decorator:',
      requiredRoles,
    ); // ADD THIS

    if (!requiredRoles || requiredRoles.length === 0) {
      // Added length check for robustness
      console.log(
        'RolesGuard DEBUG: No roles required or empty array, allowing access.',
      );
      return true; // If no @Roles decorator or empty array, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Get the user object from the request

    console.log('RolesGuard DEBUG: User object from request (req.user):', user); // ADD THIS

    if (!user) {
      console.error(
        'RolesGuard DEBUG: User object is UNDEFINED or NULL! Authentication failed BEFORE RolesGuard.',
      );
      // This would typically mean AuthGuard('jwt') failed or didn't populate req.user
      return false; // Deny access if user is not authenticated
    }

    if (!user.role) {
      console.error(
        'RolesGuard DEBUG: User object exists, but user.role is missing or undefined!',
        user,
      );
      return false; // Deny access if role is missing
    }

    console.log(
      'RolesGuard DEBUG: User Role (from JWT/req.user):',
      user.role,
      'Type:',
      typeof user.role,
    ); // ADD THIS

    const hasRole = requiredRoles.some((role) => user.role === role);

    console.log(
      'RolesGuard DEBUG: Result of role comparison (hasRole):',
      hasRole,
    ); // ADD THIS
    return hasRole;
  }
}
