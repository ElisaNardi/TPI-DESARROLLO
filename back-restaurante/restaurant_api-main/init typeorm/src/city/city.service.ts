import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../entities/city/city.entity';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
  ) {}

  create(data: Partial<City>) {
    const newCity = this.cityRepository.create(data);
    return this.cityRepository.save(newCity);
  }

  findAll() {
    return this.cityRepository.find();
  }

  findOne(id: number) {
    return this.cityRepository.findOne({ where: { id } });
  }

  update(id: number, data: Partial<City>) {
    return this.cityRepository.update(id, data);
  }

  async remove(id: number) {
    await this.cityRepository.delete(id);
    return { message: 'deleted' };
  }
}
