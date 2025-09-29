import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from '../entities/restaurant/restaurant.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

// Este controlador ahora solo se encarga de los RESTAURANTES, no de sus menús.
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  // --- ENDPOINTS PROTEGIDOS PARA ADMINS (CRUD de Restaurantes) ---
  @Post()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  create(@Body() data: Partial<Restaurant>) {
    return this.restaurantService.create(data);
  }

  @Put(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  update(@Param('id') id: string, @Body() data: Partial<Restaurant>) {
    return this.restaurantService.update(+id, data);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  remove(@Param('id') id: string) {
    return this.restaurantService.remove(+id);
  }
  
  // --- ENDPOINTS PÚBLICOS (Lectura de Restaurantes) ---
  @Get()
  findAll() {
    return this.restaurantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.restaurantService.findOne(+id);
  }
  
}