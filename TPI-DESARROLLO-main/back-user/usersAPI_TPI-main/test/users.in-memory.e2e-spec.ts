// Pruebas de integración simples para UsersController usando repositorios en memoria.
// El objetivo es ejercitar el flujo controller -> service sin depender de una base real.
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { UserController } from '../src/users/users.controller';
import { UserService } from '../src/users/users.service';
import { UserEntity } from '../src/entities/user.entity';
import { RoleEntity } from '../src/entities/role.entity';
import { PermissionsGuard } from '../src/middlewares/permissions.guard';

// Los repositorios mock usan este helper para manejar claves primarias numéricas.
interface WithId {
  id?: number;
}

// Clon profundo para que el servicio no modifique referencias internas del repositorio.
const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

// Implementa los métodos mínimos que usa TypeORM en UserService, pero en memoria.
const createInMemoryRepository = <T extends WithId>() => {
  let items: T[] = [];

  return {
    // Carga un conjunto inicial de registros (fixtures).
    seed(data: T[]) {
      items = data.map(deepClone);
    },
    // Limpia todo el estado cuando una prueba finaliza.
    clear() {
      items = [];
    },
    // Devuelve todos los registros disponibles.
    async find(): Promise<T[]> {
      return items.map(deepClone);
    },
    // Busca un registro con criterios parciales.
    async findOne(options: { where: Partial<T> }): Promise<T | null> {
      const criteria = options?.where ?? {};
      const entry = items.find(item =>
        Object.entries(criteria).every(([key, value]) => {
          const current = item[key as keyof T];
          if (typeof current === 'number' && typeof value === 'string') {
            return current === Number(value);
          }
          if (typeof current === 'string' && typeof value === 'number') {
            return current === String(value);
          }
          return current === value;
        }),
      );
      return entry ? deepClone(entry) : null;
    },
    // Alias que replica findOneBy de TypeORM.
    async findOneBy(criteria: Partial<T>): Promise<T | null> {
      return this.findOne({ where: criteria });
    },
    // Guarda un registro; genera ID si falta y reemplaza la versión previa.
    async save(entity: T): Promise<T> {
      const draft = deepClone(entity);
      if (!draft.id) {
        const lastId = items.reduce((max, item) => Math.max(max, item.id ?? 0), 0);
        draft.id = lastId + 1;
      }

      const idx = items.findIndex(item => (item.id ?? 0) === draft.id);
      if (idx === -1) {
        items.push(deepClone(draft));
      } else {
        const merged = { ...items[idx], ...draft };
        items[idx] = deepClone(merged);
      }

      const fresh = items.find(item => (item.id ?? 0) === draft.id);
      return deepClone(fresh as T);
    },
    // Permite inspeccionar el estado interno si lo necesitás durante depuración.
    snapshot(): T[] {
      return items.map(deepClone);
    },
  };
};

describe('UsersController (in-memory integration)', () => {
  let app: INestApplication;
  let userRepository: ReturnType<typeof createInMemoryRepository<UserEntity>>;
  let roleRepository: ReturnType<typeof createInMemoryRepository<RoleEntity>>;

  beforeAll(async () => {
    // Repos in-memory que se inyectarán en el servicio real.
    userRepository = createInMemoryRepository<UserEntity>();
    roleRepository = createInMemoryRepository<RoleEntity>();

    // Montamos un módulo de prueba con el controlador y servicio reales.
    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepository },
        { provide: getRepositoryToken(RoleEntity), useValue: roleRepository },
      ],
    })
      // Evitamos la validación real de permisos para simplificar el escenario.
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    // Creamos la aplicación Nest para enviar requests HTTP con Supertest.
    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    // Cada prueba arranca con “tablas” limpias.
    userRepository.clear();
    roleRepository.clear();
  });

  afterAll(async () => {
    // Cerramos la instancia Nest creada para estas pruebas.
    await app.close();
  });

  it('GET /users devuelve un arreglo vacío cuando no hay datos', async () => {
    // Sin datos precargados el endpoint debe devolver [].
    await request(app.getHttpServer()).get('/users').expect(200).expect([]);
  });

  it('GET /users devuelve usuarios con sus roles cargados', async () => {
    // Seed con un rol y un usuario que lo tenga asignado.
    const adminRole = {
      id: 1,
      name: 'admin',
      description: 'Administrador',
      permissions: [],
    } as RoleEntity;

    roleRepository.seed([adminRole]);
    userRepository.seed([
      {
        id: 1,
        email: 'john@example.com',
        nombre: 'John',
        apellido: 'Doe',
        password: 'hashed',
        roles: [adminRole],
      } as UserEntity,
    ]);

    // El controlador debería devolver al menos un usuario con el rol incluido.
    const { body } = await request(app.getHttpServer()).get('/users').expect(200);

    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      email: 'john@example.com',
      roles: [{ name: 'admin' }],
    });
  });

  it('POST /users/:id/roles asigna un rol existente', async () => {
    // Seed con un usuario sin roles y un rol disponible.
    const manager = {
      id: 1,
      name: 'manager',
      description: 'Manager',
      permissions: [],
    } as RoleEntity;

    roleRepository.seed([manager]);
    userRepository.seed([
      {
        id: 1,
        email: 'jane@example.com',
        nombre: 'Jane',
        apellido: 'Doe',
        password: 'hashed',
        roles: [],
      } as UserEntity,
    ]);

    // La API debe crear la relación y devolver el usuario con el nuevo rol.
    const { body } = await request(app.getHttpServer())
      .post('/users/1/roles')
      .send({ roleName: 'manager' })
      .expect(201);

    expect(body.roles).toHaveLength(1);
    expect(body.roles[0].name).toBe('manager');

    // Confirmamos que el repositorio refleja el cambio persistido.
    const persistedUser = await userRepository.findOne({ where: { id: 1 } });
    expect(persistedUser?.roles).toHaveLength(1);
  });
});
