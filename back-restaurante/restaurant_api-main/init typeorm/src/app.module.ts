// --- Módulos de NestJS ---
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigService es necesario para la inyección
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// --- Módulos de nuestra aplicación ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RestaurantModule } from './restaurant/restaurant.module';
import { MenuModule } from './menu/menu.module';
import { CityModule } from './city/city.module';
import { AuthModule } from './auth/auth.module'; // Nuestro módulo de seguridad
import { JwtStrategy } from './auth/jwt.strategy'; // Importamos nuestra estrategia JWT

@Module({
  imports: [
    // 1. Configuración de variables de entorno (lee el archivo .env)
    ConfigModule.forRoot({
      isGlobal: true, // Hace que ConfigModule esté disponible en toda la app
    }),

    // 2. Conexión principal a la base de datos de restaurantes
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'restaurants', // Nombre sugerido para la DB de restaurantes
      // Esta propiedad le dice a TypeORM que automáticamente encuentre y cargue
      // todas las entidades que estén registradas en los 'imports' de este módulo
      // (como en RestaurantModule, MenuModule, CityModule).
      autoLoadEntities: true,
      synchronize: true, // crea/actualiza las tablas automáticamente, Solo para desarrollo
    }),

    // 3. Módulo de Passport para manejar las estrategias de autenticación
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // 4. Módulo JWT, configurado de forma asíncrona y robusta
    JwtModule.registerAsync({
      imports: [
        ConfigModule,
        // Importamos AuthModule para asegurar que JwtStrategy esté disponible para ser inyectada
        AuthModule, 
      ],
      // Le decimos a NestJS que use nuestra clase JwtStrategy para generar las opciones.
      // Esto garantiza que el ConfigService y el secreto se resuelvan correctamente.
      useExisting: JwtStrategy,
      inject: [ConfigService],
    }),

    // 5. Módulos de funcionalidades de nuestra aplicación
    RestaurantModule,
    MenuModule,
    CityModule,
    AuthModule, 
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy], 
  exports: [JwtStrategy, PassportModule], 
})
export class AppModule {}