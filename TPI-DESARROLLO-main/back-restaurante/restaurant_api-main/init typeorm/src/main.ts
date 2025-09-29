// back-restaurante/restaurant_api-main/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedCities } from './seed/city.seed';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permite que el frontend se comunique con este backend
  app.enableCors({
    origin: 'http://localhost:4200',
  });

  // Ejecuta el seeder al iniciar
  const dataSource = app.get(DataSource);
  await seedCities(dataSource);

  // Escucha en el puerto 3001
  await app.listen(3001);
}
bootstrap();
