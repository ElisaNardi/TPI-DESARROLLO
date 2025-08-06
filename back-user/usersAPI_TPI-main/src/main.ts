// back-user/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

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

  await app.listen(4001); 
}
bootstrap();