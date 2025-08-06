// src/city/city.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from '../entities/city/city.entity';
import { CityController } from './city.controller';
import { CityService } from './city.service';

@Module({
  imports: [TypeOrmModule.forFeature([City])],
  controllers: [CityController],
  providers: [CityService],
  // Exportamos el TypeOrmModule para que otros módulos que importen
  // CityModule puedan inyectar 'CityRepository'.
  exports: [TypeOrmModule]
})
export class CityModule {}