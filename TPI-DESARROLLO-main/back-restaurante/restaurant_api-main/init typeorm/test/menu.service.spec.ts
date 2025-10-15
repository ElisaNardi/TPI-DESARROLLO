// src/menu/menu.service.spec.ts
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Menu } from '../src/entities/menu/menu.entity';
import { Restaurant } from '../src/entities/restaurant/restaurant.entity';
import { MenuService } from '../src/menu/menu.service';


// —— Helpers de mock mínimos para repos TypeORM —— //
function createRepoMock<T extends import('typeorm').ObjectLiteral>() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  } as unknown as jest.Mocked<Repository<T>>;
}

// Simula un EntityManager que usa el servicio dentro de la transacción
function createEntityManagerMock() {
  return {
    findOneBy: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      delete: function () { return this; },
      from: function () { return this; },
      where: function () { return this; },
      execute: jest.fn().mockResolvedValue({}),
    }),
  };
}

describe('MenuService', () => {
  let service: MenuService;
  let menuRepo: jest.Mocked<Repository<Menu>>;
  let restaurantRepo: jest.Mocked<Repository<Restaurant>>;
  let dataSource: DataSource;

  beforeEach(() => {
    jest.clearAllMocks();

    menuRepo = createRepoMock<Menu>();
    restaurantRepo = createRepoMock<Restaurant>();

    // Mock de DataSource.transaction(cb) -> ejecuta cb(em) con un EM mockeado
    const em = createEntityManagerMock();
    dataSource = {
      transaction: jest.fn().mockImplementation(async (cb: any) => cb(em)),
    } as unknown as DataSource;

    service = new MenuService(menuRepo, restaurantRepo, dataSource);
  });

  describe('bulkSave', () => {
    it('borra el menú previo y guarda ítems únicos (de-dupe en memoria)', async () => {
      // arrange
      const restaurantId = 1;
      const em = createEntityManagerMock();
      // rehacemos el mock de transaction para espiar llamadas del EM
      (dataSource.transaction as jest.Mock).mockImplementation(async (cb: any) => cb(em));
      // existe el restaurante
      (em.findOneBy as jest.Mock).mockResolvedValue({ id: restaurantId } as Restaurant);
      const payload = [
        { name: 'Cafecito', description: 'expreso', price: 2700, category: 'Cafetería' },
        { name: 'Cafecito', description: 'expreso', price: 2700, category: 'Cafetería' }, // duplicado
        { name: 'Espresso', description: 'intenso', price: 2500, category: 'Cafetería' },
      ];
      // el create del EM devuelve entidades (podemos devolver el mismo input + restaurantId)
      (em.create as jest.Mock).mockImplementation((_entity, dto) => ({ ...dto, id: undefined }));
      // save devuelve con ids simulados
      (em.save as jest.Mock).mockImplementation(async (_entity, arr) =>
        arr.map((x: any, i: number) => ({ ...x, id: i + 1 })),
      );
      // act
      const result = await service.bulkSave(restaurantId, payload as any);
      // assert
      // 1) se verificó el restaurante
      expect(em.findOneBy).toHaveBeenCalledWith(Restaurant, { id: restaurantId });
      // 2) se borró el menú previo de ese restaurante
      expect(em.createQueryBuilder).toHaveBeenCalled();
      // 3) se hizo de-dupe: se guardan SOLO 2 ítems (Cafecito, Espresso)
      expect(em.save).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      const names = result.map((x: any) => x.name).sort();
      expect(names).toEqual(['Cafecito', 'Espresso']);
      // 4) cada entidad creada incluye restaurantId y defaults
      expect(em.create).toHaveBeenCalledWith(Menu, expect.objectContaining({
        restaurantId,
      }));
    });

    it('lanza NotFoundException si el restaurante no existe', async () => {
      const em = createEntityManagerMock();
      (dataSource.transaction as jest.Mock).mockImplementation(async (cb: any) => cb(em));

      (em.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(
        service.bulkSave(99, [{ name: 'X', price: 1 } as any]),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('mapea error 23505 (unique_violation) a ConflictException', async () => {
      const restaurantId = 1;
      const em = createEntityManagerMock();
      (dataSource.transaction as jest.Mock).mockImplementation(async (cb: any) => cb(em));

      (em.findOneBy as jest.Mock).mockResolvedValue({ id: restaurantId } as Restaurant);
      (em.create as jest.Mock).mockImplementation((_e, dto) => dto);

      // Simulamos que Postgres rompe la unique (restaurantId,name)
      const uniqueViolation = Object.assign(new Error('duplicate key'), { code: '23505' });
      (em.save as jest.Mock).mockRejectedValue(uniqueViolation);

      await expect(
        service.bulkSave(restaurantId, [{ name: 'Cafecito', price: 1 } as any]),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('si el payload viene vacío, deja el menú vacío y no guarda nada', async () => {
      const restaurantId = 1;
      const em = createEntityManagerMock();
      (dataSource.transaction as jest.Mock).mockImplementation(async (cb: any) => cb(em));

      (em.findOneBy as jest.Mock).mockResolvedValue({ id: restaurantId } as Restaurant);

      const result = await service.bulkSave(restaurantId, []);

      expect(result).toEqual([]);
      // se llamó al delete
      expect(em.createQueryBuilder).toHaveBeenCalled();
      // no se intentó guardar
      expect(em.save).not.toHaveBeenCalled();
    });
  });

  describe('findByRestaurant', () => {
    it('devuelve los menús del restaurante ordenados por categoría y nombre', async () => {
      menuRepo.find.mockResolvedValue([
        { id: 1, name: 'Americano', category: 'Cafetería', restaurantId: 1 } as any,
        { id: 2, name: 'Espresso', category: 'Cafetería', restaurantId: 1 } as any,
      ]);
      const out = await service.findByRestaurant(1);
      expect(menuRepo.find).toHaveBeenCalledWith({
        where: { restaurantId: 1 },
        order: { category: 'ASC', name: 'ASC' },
      });
      expect(out).toHaveLength(2);
    });
  });
});