import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Habilitamos CORS. Esto le dice a nuestro backend que está bien aceptar
   * peticiones que vengan desde la dirección de nuestro frontend de Angular.
   * Sin esto, el navegador bloqueará las respuestas por seguridad.
   */
  app.enableCors({
    origin: 'http://localhost:4200', // La dirección de tu app de Angular
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

/**
   * 'app.useGlobalPipes' le dice a NestJS que aplique una "tubería" de validación a TODAS las peticiones entrantes.
   * 'new ValidationPipe()' usará 'class-validator' para comprobar automáticamente
   * si el 'body' de una petición coincide con el DTO definido en el controlador.
   */
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(4001); 
}
bootstrap();