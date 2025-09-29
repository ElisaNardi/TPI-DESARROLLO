import { Module } from '@nestjs/common'; // Decorador principal para definir el módulo
import { TypeOrmModule } from '@nestjs/typeorm'; // Permite inyectar repositorios de entidades
import { UserEntity } from '../entities/user.entity'; // Entidad de usuarios
import { RoleEntity } from '../entities/role.entity'; // Entidad de roles
import { UserService } from './users.service'; // Lógica de negocio del usuario
import { UserController } from './users.controller'; // Endpoints del usuario
import { RoleModule } from 'src/roles/roles.module'; // Para poder usar funcionalidades de roles
import { JwtModule } from '../jwt/jwt.module'; // ✅ IMPORTANTE: para que funcione PermissionsGuard

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RoleEntity]), // Inyecta los repositorios de estas entidades
    RoleModule,     // Para poder asignar roles desde UserService
    JwtModule,      // ✅ Necesario para que JwtService esté disponible en este módulo
  ],
  providers: [
    UserService, // Lógica del módulo
  ],
  controllers: [
    UserController, // Controlador del módulo
  ],
  exports: [
    UserService, // Se exporta para que otros módulos puedan usarlo
  ],
})
export class UserModule {}
