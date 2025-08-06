// Este guard protege endpoints según permisos definidos con @Permissions()
// También permite acceso libre a rutas públicas con @Public()

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core'; // Permite leer metadatos de decoradores
import { JwtService } from '../jwt/jwt.service'; // Servicio personalizado para manejar JWT

import { PERMISSIONS_KEY } from './decorators/permissions.decorator'; // Clave que usa el decorador @Permissions
import { IS_PUBLIC_KEY } from './decorators/public.decorator'; // Clave para saber si una ruta es pública

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // ✅ 1. Permitir acceso si la ruta está marcada como pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (isPublic) {
      return true; // Ruta pública → dejar pasar sin token
    }

    // ✅ 2. Obtener los permisos requeridos (si los hay)
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // ✅ 3. Obtener el token del header Authorization
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Falta el header Authorization');
    }

    const token = authHeader.replace('Bearer ', ''); // Limpiar el prefijo Bearer

    try {
      // ✅ 4. Verificar el token con nuestro servicio personalizado
      const payload = this.jwtService.getPayload(token, 'auth');

      // ✅ 5. Adjuntar usuario al request para reutilizar
      request.user = payload;

      // ✅ 6. Si no hay permisos requeridos, igual dejar pasar (solo pide token válido)
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
      }

      // ✅ 7. Verificar si el usuario tiene al menos un permiso requerido
      const hasPermission = requiredPermissions.some(permission =>
        payload.permissionCodes.includes(permission)
      );

      if (!hasPermission) {
        throw new ForbiddenException('No tenés permisos para acceder a esta ruta');
      }

      return true; // ✅ Todo OK
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
