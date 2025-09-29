//leerá los metadatos que estan en  carpeta src/common/guards.

// src/common/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core'; // Reflector nos permite leer los metadatos.
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  // Inyectamos el servicio Reflector.
  constructor(private reflector: Reflector) {}

  // El método canActivate debe devolver true (permitir acceso) o false (bloquear acceso).
  canActivate(context: ExecutionContext): boolean {
    // 1. Usamos el Reflector para leer los roles requeridos que definimos con el decorador @Roles().
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(), // Busca metadatos en el manejador de la ruta (el método del controlador).
      context.getClass(),   // Busca metadatos a nivel de clase del controlador.
    ]);

    // 2. Si la ruta no tiene el decorador @Roles(), no se requieren roles especiales. Permitimos el acceso.
    if (!requiredRoles) {
      return true;
    }

    // 3. Obtenemos el objeto 'request' de la petición HTTP.
    const request = context.switchToHttp().getRequest();
    
    // 4. Obtenemos el 'user' del request. Este objeto 'user' fue adjuntado por nuestra JwtStrategy.
    const user = request.user;

    // 5. La lógica de autorización:
    //    Verificamos si el array de roles del usuario (user.roles) incluye (some) al menos uno de los roles requeridos.
    //    user.roles viene del payload del token (ej: ['user'] o ['admin']).
    //    requiredRoles viene del decorador (ej: ['admin']).
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}