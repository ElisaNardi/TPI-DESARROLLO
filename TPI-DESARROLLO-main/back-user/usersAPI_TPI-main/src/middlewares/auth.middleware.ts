import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../jwt/jwt.service';
import { UserService } from '../users/users.service';
import { RequestWithUser } from '../interfaces/request-user';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    //  1. Obtener el header Authorization
    const authHeader = req.headers['authorization'];

    //  Si no viene el header, lanzar excepción 401
    if (!authHeader) {
      throw new UnauthorizedException('Falta el header Authorization');
    }

    //  2. Extraer el token (sacando el "Bearer ")
    const token = authHeader.replace('Bearer ', '');

    try {
      const payload: any = this.jwtService.getPayload(token, 'auth');

      // ajustá la clave según tu payload (id, sub, userId)
      const userId = payload?.id ?? payload?.sub ?? payload?.userId;
      if (!userId) throw new UnauthorizedException('Token sin id de usuario');

      const userEntity = await this.userService.findById(Number(userId));
      if (!userEntity) throw new UnauthorizedException('Usuario no encontrado');

      req.user = userEntity; //  ahora coincide con RequestWithUser
      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
