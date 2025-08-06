import { Controller, Post, Get, Param, Body, Put, Delete } from '@nestjs/common';
import { CityService } from './city.service';
import { City } from '../entities/city/city.entity';

@Controller('city')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  create(@Body() city: Partial<City>) {
    return this.cityService.create(city);
  }

  @Get()
  findAll() {
    return this.cityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.cityService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() city: Partial<City>) {
    return this.cityService.update(id, city);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.cityService.remove(id);
  }
}
