import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';
import * as dayjs from 'dayjs';

interface Payload {
  id: number;
  email: string;
  permissionCodes: string[];
  iat?: number;
  exp?: number;
}

type TokenKind = 'auth' | 'refresh';

type TokenCfg = Record<
  TokenKind,
  {
    secret: Secret;                 // <- tipamos como Secret (string es válido)
    expiresIn: string | number;     // <- '15m' | '7d' | 3600, etc.
  }
>;

@Injectable()
export class JwtService {
  private readonly config: TokenCfg = {
    auth: {
      secret: (process.env.JWT_SECRET || 'ACCESS_SECRET') as Secret,
      expiresIn: '15m',
    },
    refresh: {
      secret: (process.env.REFRESH_SECRET || 'REFRESH_SECRET') as Secret,
      expiresIn: '7d',
    },
  };

  generateToken(
    payload: Omit<Payload, 'iat' | 'exp'>,
    type: TokenKind = 'auth',
  ): string {
    const secret: Secret = this.config[type].secret;
    const expiresIn = this.config[type].expiresIn as SignOptions['expiresIn'];
    const options: SignOptions = { expiresIn }; 
    return jwt.sign(payload, secret, options);
  }

  refreshToken(refreshToken: string): { accessToken: string; refreshToken: string } {
    try {
      const payload = this.getPayload(refreshToken, 'refresh');
      const timeToExpire = dayjs.unix(payload.exp!).diff(dayjs(), 'minute');

      const basePayload = {
        id: payload.id,
        email: payload.email,
        permissionCodes: payload.permissionCodes,
      };

      return {
        accessToken: this.generateToken(basePayload, 'auth'),
        refreshToken:
          timeToExpire < 20
            ? this.generateToken(basePayload, 'refresh')
            : refreshToken,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  getPayload(token: string, type: TokenKind = 'auth'): Payload {
    const secret: Secret = this.config[type].secret;
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded as unknown as Payload;
  }

  verifyToken(token: string, type: TokenKind = 'auth') {
    try {
      return this.getPayload(token, type);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
