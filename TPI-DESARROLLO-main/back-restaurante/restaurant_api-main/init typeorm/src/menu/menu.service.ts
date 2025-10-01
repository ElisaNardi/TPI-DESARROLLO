// src/menu/menu.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Menu } from '../entities/menu/menu.entity';
import { Restaurant } from '../entities/restaurant/restaurant.entity';

export class CreateMenuItemDto {
  name: string;
  description?: string | null;
  price: number;
  category?: string;
}

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu) private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly dataSource: DataSource,
  ) {}

 async bulkSave(restaurantId: number, menuItems: CreateMenuItemDto[]) {
  return this.dataSource.transaction(async (em) => {
    // 1) Verifico que exista el restaurante
    const restaurant = await em.findOneBy(Restaurant, { id: restaurantId });
    if (!restaurant) throw new NotFoundException(`Restaurante ${restaurantId} no encontrado`);

    // 2) Borro el menú previo de ese restaurante
    await em
      .createQueryBuilder()
      .delete()
      .from(Menu)
      .where('"restaurantId" = :id', { id: restaurantId })
      .execute();

    if (!menuItems?.length) return []; // si viene vacío, queda sin menú

    // 3) De-dupe en memoria por nombre
    const byName = new Map<string, CreateMenuItemDto>();
    for (const it of menuItems) {
      const key = it.name.trim();
      if (!byName.has(key)) byName.set(key, it);
    }

    // 4) Creo y guardo entidades
    const entities = [...byName.values()].map((dto) =>
      em.create(Menu, {
        name: dto.name.trim(),
        description: dto.description ?? null,
        price: dto.price,
        category: dto.category ?? 'General',
        restaurantId,
      }),
    );

    try {
      return await em.save(Menu, entities);
    } catch (e: any) {
      // 23505: unique_violation en Postgres
      if (e?.code === '23505') {
        throw new ConflictException('Ya existe un ítem con ese nombre en este restaurante');
      }
      throw e;
    }
  });
}

//Listar el menú ordenado, devuelve los menús del restaurante ya ordenados por categoría y nombre.
  async findByRestaurant(restaurantId: number): Promise<Menu[]> {
    return this.menuRepository.find({
      where: { restaurantId },
      order: { category: 'ASC', name: 'ASC' },
    });
  }
}
