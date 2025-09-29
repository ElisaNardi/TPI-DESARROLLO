// src/auth/auth.module.ts

// --- Módulos de NestJS ---
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport'; // Importa el módulo principal de Passport.
import { JwtModule } from '@nestjs/jwt'; // Importa el módulo de JWT.
import { ConfigModule } from '@nestjs/config'; // Importa el módulo de Configuración para poder usarlo en JwtModule.registerAsync

// --- Componentes de nuestra aplicación ---
import { JwtStrategy } from './jwt.strategy'; // Importa nuestra lógica personalizada para validar tokens.

// El decorador @Module define a esta clase como un módulo de NestJS.
@Module({
  // 'imports' es un array de otros módulos cuyas funcionalidades queremos usar aquí.
  imports: [
    // 1. PassportModule: Es la base para cualquier tipo de autenticación en NestJS.
    //    Lo registramos y definimos 'jwt' como la estrategia que usaremos por defecto
    //    cuando apliquemos el AuthGuard sin especificar una estrategia.
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // 2. JwtModule: Aunque la configuración principal (con el secreto) la hicimos de forma asíncrona
    //    en app.module.ts, es una buena práctica importar el módulo aquí también para asegurar
    //    que todos los servicios relacionados con JWT (si los hubiera) estén disponibles dentro de este módulo.
    //    .register({}) con un objeto vacío es suficiente en este caso.
    JwtModule.register({}),
    
    // 3. ConfigModule: Lo importamos para que esté disponible si algún servicio
    //    dentro de este módulo lo necesita (aunque en este caso, es la JwtStrategy la que lo usa
    //    y ya lo inyecta desde la configuración global).
    ConfigModule,
  ],
  // 'providers' es donde registramos los servicios que pertenecen a este módulo.
  // Aquí es donde "damos de alta" nuestra JwtStrategy para que NestJS sepa que existe
  // y pueda inyectarla donde se necesite (como en el PassportModule).
  providers: [
    JwtStrategy
  ],
  // 'exports' define qué partes de este módulo queremos que sean "públicas" y utilizables
  // por otros módulos que importen AuthModule.
  exports: [
    // Exportamos nuestra JwtStrategy para que el 'useExisting: JwtStrategy' en app.module.ts pueda encontrarla.
    JwtStrategy,
    // Exportamos PassportModule para que otros módulos puedan usar el AuthGuard('jwt') fácilmente.
    PassportModule,
  ],
})
export class AuthModule {}