// back-user/test/auth.register.int-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';

import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';         
import { JwtService } from '../src/jwt/jwt.service';            
import { UserEntity } from '../src/entities/user.entity';       
import { RoleEntity } from '../src/entities/role.entity';       

import * as bcrypt from 'bcrypt';

// ————— Helpers: repos mock y Jwt fake —————
function createRepoMock<T>() {
  return {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn((x: any) => x),
  } as any;
}

class JwtServiceMock {
  generateToken = jest.fn((payload: any) => `fake.jwt.for.${payload?.email ?? 'user'}`);
  refreshToken = jest.fn(() => `fake.refresh.jwt`);
}

describe('Auth /auth/register (integración sin BD)', () => {
  let app: INestApplication;

  // repos “dobles” (sin BD)
  const userRepo = createRepoMock<UserEntity>();
  const roleRepo = createRepoMock<RoleEntity>();
  const jwtMock = new JwtServiceMock();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],   // usamos controller real
      providers: [
        AuthService,                    // y service real
        { provide: JwtService, useValue: jwtMock },

        // reemplazamos repos TypeORM por mocks
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(RoleEntity), useValue: roleRepo },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    // Validación real de DTOs (como en runtime)
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const server = () => app.getHttpServer();

  // ========== Caso feliz ==========
  it('201: registra usuario nuevo (hash, rol "user", mapeo correcto)', async () => {
    const dto = {
      email: 'ada@demo.com',
      password: 'Secr3t!',
      name: 'Ada',
      lastName: 'Lovelace',
    };

    // 1) No existe usuario con ese email
    userRepo.findOne.mockResolvedValue(null);

    // 2) Hash de contraseña
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hashed-password' as any);

    // 3) Rol por defecto existe
    roleRepo.findOne.mockResolvedValue({ id: 7, name: 'user' });

    // 4) Guardado exitoso
    userRepo.save.mockImplementation(async (u: any) => ({ id: 1, ...u }));

    const res = await request(server()).post('/auth/register').send(dto).expect(201);

    // Verificaciones clave
    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
    expect(bcrypt.hashSync).toHaveBeenCalledWith(dto.password, 10);
    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: dto.email,
        password: 'hashed-password',
        nombre: dto.name,
        apellido: dto.lastName,
        roles: [expect.objectContaining({ name: 'user' })],
      }),
    );

    // Contrato de respuesta (ajustá si tu controller oculta password o cambia campos)
    expect(res.body).toEqual(
      expect.objectContaining({
        id: 1,
        email: dto.email,
        nombre: dto.name,
        apellido: dto.lastName,
      }),
    );
  });

  // ========== Email duplicado ==========
  it('409: conflicto si el email ya existe', async () => {
    const dto = {
      email: 'ada@demo.com',
      password: 'Secr3t!',
      name: 'Ada',
      lastName: 'Lovelace',
    };

    userRepo.findOne.mockResolvedValue({ id: 99, email: dto.email });

    const res = await request(server()).post('/auth/register').send(dto).expect(409);

    // No debería ni hashear ni guardar
    expect(bcrypt.hashSync).not.toHaveBeenCalled();
    expect(userRepo.save).not.toHaveBeenCalled();
    expect(res.body.message || res.text).toBeDefined();
  });

  // ========== Falta el rol "user" ==========
  it('404: si no existe el rol "user"', async () => {
    const dto = {
      email: 'ada@demo.com',
      password: 'Secr3t!',
      name: 'Ada',
      lastName: 'Lovelace',
    };

    userRepo.findOne.mockResolvedValue(null);
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hash' as any);
    roleRepo.findOne.mockResolvedValue(null); // 👈 simulamos ausencia de rol

    const res = await request(server()).post('/auth/register').send(dto).expect(404);

    expect(userRepo.save).not.toHaveBeenCalled();
    expect(res.body.message || res.text).toBeDefined();
  });

  // ========== Error al guardar ==========
  it('500: si el repositorio falla al guardar', async () => {
    const dto = {
      email: 'ada@demo.com',
      password: 'Secr3t!',
      name: 'Ada',
      lastName: 'Lovelace',
    };

    userRepo.findOne.mockResolvedValue(null);
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hash' as any);
    roleRepo.findOne.mockResolvedValue({ id: 7, name: 'user' });
    userRepo.save.mockRejectedValue(new Error('DB failed')); // 👈 simulamos caída

    const res = await request(server()).post('/auth/register').send(dto).expect(500);

    expect(res.body.message || res.text).toBeDefined();
  });

  // (Opcional) Validación DTO: campos desconocidos -> 400
  it('400: si envían campos extra no permitidos', async () => {
    const bad = {
      email: 'mal@demo.com',
      password: 'Secr3t!',
      name: 'Mal',
      lastName: 'Test',
      hacker: '😈', // 👈 campo no declarado en DTO
    };

    await request(server()).post('/auth/register').send(bad).expect(400);
  });
});
