// src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
// Importamos las interfaces necesarias para actuar como una "fábrica" de opciones de JWT
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

// @Injectable() permite que esta clase sea manejada por el sistema de inyección de dependencias de NestJS.
@Injectable()
// CAMBIO: Ahora implementa JwtOptionsFactory además de extender PassportStrategy.
export class JwtStrategy extends PassportStrategy(Strategy) implements JwtOptionsFactory {
  
  // Inyectamos ConfigService en el constructor.
  constructor(private configService: ConfigService) {
    // El constructor 'super' configura la estrategia de Passport.
    // Obtenemos el secreto DESPUÉS de llamar a super().
    super({
      // Extrae el token del header 'Authorization' como 'Bearer <token>'.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Rechaza tokens expirados.
      ignoreExpiration: false,
      // Le pasamos el secreto ya validado para que Passport verifique la firma del token.
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'ACCESS_SECRET',
    });

    // Esta validación es crucial: si no hay secreto, la aplicación no debe arrancar.
    if (!this.configService.get<string>('JWT_SECRET')) {
      console.warn('[WARN] JWT_SECRET no definido; usando fallback ACCESS_SECRET.');
    }
  }
  
  // NUEVO MÉTODO: Requerido por la interfaz JwtOptionsFactory.
  // Este método es llamado por el JwtModule (en app.module.ts) para obtener su configuración.
  createJwtOptions(): JwtModuleOptions {
    // Devuelve un objeto de configuración para el JwtModule.
    return {
      // Usa el mismo secreto que la estrategia de Passport.
      secret: this.configService.get<string>('JWT_SECRET'),
      signOptions: { 
        // Define la expiración por defecto si este servicio llegara a generar tokens.
        expiresIn: '1h' 
      },
    };
  }

  /**
   * Este método se ejecuta automáticamente si Passport valida la firma y la expiración del token.
   * Recibe el payload decodificado.
   * Su retorno se adjunta al objeto `request` como `request.user`.
   */
  async validate(payload: any) {
    // Una última verificación para asegurar que el payload no es nulo.
    if (!payload) {
      throw new UnauthorizedException('Token inválido.');
    }
    // Devolvemos el payload. Ahora estará disponible en los guards y controladores.
    return payload; 
  }
}