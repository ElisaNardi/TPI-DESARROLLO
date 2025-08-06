// Importamos decoradores y excepciones comunes de NestJS
import { Injectable, UnauthorizedException } from '@nestjs/common';

// Importamos las funciones de generación y verificación de tokens
import { sign, verify } from 'jsonwebtoken';

// Importamos dayjs para manejar fechas fácilmente
import * as dayjs from 'dayjs';

// Definimos la estructura del payload que se guarda en el token
interface Payload {
  id: number;
  email: string;
  permissionCodes: string[]; // Permisos asociados al usuario
  iat?: number; // issued at (generado en)
  exp?: number; // expiration (fecha de expiración)
}

@Injectable() // Decorador que indica que esta clase se puede inyectar como servicio
export class JwtService {
  // Configuración de los tokens: secretos y tiempo de expiración
  private config = {
    auth: {
      secret: process.env.JWT_SECRET || 'ACCESS_SECRET',
      expiresIn: '15m',
    },
    refresh: {
      secret: process.env.REFRESH_SECRET || 'REFRESH_SECRET',
      expiresIn: '7d',
    },
};

  // Método para generar un token (access o refresh)
  generateToken(
    payload: Omit<Payload, 'iat' | 'exp'>, // Payload sin iat ni exp
    type: 'refresh' | 'auth' = 'auth'      // Tipo por defecto: 'auth'
  ): string {
    // Usamos la configuración correspondiente según el tipo
    return sign(payload, this.config[type].secret, {
      expiresIn: this.config[type].expiresIn,
    });
  }

  // Método que genera nuevos tokens a partir del refresh token
  refreshToken(refreshToken: string): { accessToken: string; refreshToken: string } {
    try {
      // Verificamos el token y sacamos los datos del usuario
      const payload = this.getPayload(refreshToken, 'refresh');

      // Calculamos cuánto falta para que expire (en minutos)
      const timeToExpire = dayjs.unix(payload.exp).diff(dayjs(), 'minute');

      // Si está por expirar pronto, generamos un nuevo refresh token
      return {
        accessToken: this.generateToken(
          { id: payload.id, email: payload.email, permissionCodes: payload.permissionCodes },
          'auth',
        ),
        refreshToken:
          timeToExpire < 20 // Si faltan menos de 20 min para que venza, lo renovamos
            ? this.generateToken(
                { id: payload.id, email: payload.email, permissionCodes: payload.permissionCodes },
                'refresh',
              )
            : refreshToken, // Si no, devolvemos el mismo
      };
    } catch (error) {
      // Si algo sale mal, lanzamos excepción 401
      throw new UnauthorizedException();
    }
  }

  // Método para extraer el contenido (payload) de un token
  getPayload(token: string, type: 'refresh' | 'auth' = 'auth'): Payload {
    // Verificamos la validez del token usando el secreto adecuado
    return verify(token, this.config[type].secret) as Payload;
  }

  // ✅ Nuevo método agregado: verifica un token y lanza excepción si es inválido
  verifyToken(token: string, type: 'refresh' | 'auth' = 'auth') {
    try {
      return this.getPayload(token, type); // Reutiliza el método anterior
    } catch (err) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
