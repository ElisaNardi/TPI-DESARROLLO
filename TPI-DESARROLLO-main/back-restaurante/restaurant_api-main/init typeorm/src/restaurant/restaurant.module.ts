// src/restaurant/restaurant.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from '../entities/restaurant/restaurant.entity';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { MenuModule } from '../menu/menu.module';
// Importamos el módulo de ciudades
import { CityModule } from '../city/city.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant]),
    forwardRef(() => MenuModule),
    // Al importar CityModule, y como CityModule ahora exporta
    // su TypeOrmModule, le damos acceso a RestaurantModule
    // para encontrar e inyectar 'CityRepository'.
    CityModule
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [TypeOrmModule, RestaurantService]
})
export class RestaurantModule {}