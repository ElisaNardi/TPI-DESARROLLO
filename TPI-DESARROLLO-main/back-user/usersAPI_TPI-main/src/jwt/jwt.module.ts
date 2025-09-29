import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service'; // <- tu servicio personalizado

@Module({
  providers: [JwtService],     // Registrás el servicio como proveedor
  exports: [JwtService],       // ✅ Lo hacés exportable para otros módulos
})
export class JwtModule {}



