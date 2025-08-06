// src/app.module.ts

// Importaciones de NestJS y módulos de la aplicación.
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core'; // Para registrar guards globales.

import { AppController } from './app.controller';
import { UserModule } from './users/users.module';
import { RoleModule } from './roles/roles.module';
import { PermissionModule } from './permissions/permissions.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from './jwt/jwt.module';
import { SeederModule } from './seeder/seeder.module';

import { AuthMiddleware } from './middlewares/auth.middleware';
import { PermissionsGuard } from './middlewares/permissions.guard';

// El decorador @Module define la estructura de la aplicación.
@Module({
  // 'imports' es un array de todos los módulos que esta aplicación utilizará.
  imports: [
    // ConfigModule se encarga de cargar variables de entorno (desde un archivo .env).
    // 'isGlobal: true' hace que estas variables estén disponibles en toda la app.
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // TypeOrmModule.forRoot establece la conexión principal con la base de datos.
    TypeOrmModule.forRoot({
      type: 'postgres', // El tipo de base de datos que estás usando.
      host: 'localhost', // La dirección de tu base de datos (o la IP del contenedor Docker).
      port: 5432, // El puerto estándar de PostgreSQL.
      username: 'postgres', // El usuario para conectar a la DB.
      password: '1234', // La contraseña del usuario. ¡Mejor usar variables de entorno!
      database: 'tpi', // El nombre de la base de datos a la que se conectará.
      synchronize: true, // ¡SOLO PARA DESARROLLO! Sincroniza automáticamente tus entidades con las tablas de la DB.
      autoLoadEntities: true, // Le dice a TypeORM que cargue automáticamente las entidades definidas en los módulos.
    }),

    // Importamos todos los módulos de funcionalidades de nuestra aplicación.
    UserModule,
    RoleModule,
    PermissionModule,
    AuthModule,
    JwtModule,
    SeederModule,
  ],
  // 'controllers' es un array de los controladores de este módulo raíz.
  controllers: [AppController],
  // 'providers' es un array de los servicios. Aquí registramos el guard global.
  providers: [
    {
      provide: APP_GUARD, // Le decimos a NestJS que estamos proveyendo un guard a nivel de aplicación.
      useClass: PermissionsGuard, // Especificamos que la clase a usar es nuestro PermissionsGuard.
    },
  ],
})
export class AppModule {
  // El método 'configure' permite aplicar middlewares a rutas específicas.
  configure(consumer: MiddlewareConsumer) {
    // Le decimos a NestJS que aplique el 'AuthMiddleware'.
    consumer
      .apply(AuthMiddleware)
      // Pero que EXCLUYA las rutas públicas de login, registro y refresco de token.
      .exclude(
        { path: '/auth/register', method: RequestMethod.POST },
        { path: '/auth/login', method: RequestMethod.POST },
        { path: '/auth/refresh', method: RequestMethod.POST },
      )
      // Y que aplique el middleware al RESTO de las rutas ('*').
      .forRoutes('*');
  }
}