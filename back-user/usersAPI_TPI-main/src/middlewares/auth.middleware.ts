import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../jwt/jwt.service';
import { UserService } from '../users/users.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // ✅ 1. Obtener el header Authorization
    const authHeader = req.headers['authorization'];

    // ❌ Si no viene el header, lanzar excepción 401
    if (!authHeader) {
      throw new UnauthorizedException('Falta el header Authorization');
    }

    // ✅ 2. Extraer el token (sacando el "Bearer ")
    const token = authHeader.replace('Bearer ', '');

    try {
      // ✅ 3. Verificar el token usando el servicio JWT
      const payload = this.jwtService.getPayload(token, 'auth');

      // ✅ 4. Guardar los datos del usuario en req.user para que el guard lo use después
      req.user = payload;

      // ✅ 5. Seguir con la ejecución (permitir pasar al siguiente middleware/controlador)
      next();
    } catch (error) {
      // ❌ Si falla el token, lanzar excepción 401
      console.error('JWT verification error:', error);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
