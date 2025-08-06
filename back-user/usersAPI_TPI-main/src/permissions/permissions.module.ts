import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from '../entities/permission.entity'; // Entidad Permission
import { PermissionService } from './permissions.service'; // Lógica de negocio
import { PermissionController } from './permissions.controller'; // Endpoints
import { PermissionsGuard } from '../middlewares/permissions.guard';  // Guard personalizado para autorización
import { JwtModule } from '../jwt/jwt.module'; // ✅ Necesario porque el Guard usa JwtService

@Module({
  imports: [
    TypeOrmModule.forFeature([PermissionEntity]), // Permite usar el repositorio de esta entidad
    JwtModule, // ✅ Importante para que PermissionsGuard pueda usar JwtService
  ],
  providers: [
    PermissionService,
    PermissionsGuard, // ✅ Registramos el Guard como proveedor
  ],
  controllers: [PermissionController],
  exports: [
    PermissionService,
    PermissionsGuard, // ✅ Exportamos para usarlo desde otros módulos si hace falta
  ],
})
export class PermissionModule {}
