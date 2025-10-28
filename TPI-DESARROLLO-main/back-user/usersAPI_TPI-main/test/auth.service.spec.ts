import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AuthService } from '../src/auth/auth.service';
import { UserEntity } from '../src/entities/user.entity';
import { RoleEntity } from '../src/entities/role.entity';
import { JwtService } from '../src/jwt/jwt.service';

import * as bcrypt from 'bcrypt';

// —— Helper de mock mínimo para repos TypeORM —— //
function createRepoMock<T extends import('typeorm').ObjectLiteral>() {
  return {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  } as unknown as jest.Mocked<Repository<T>>;
}

// —— Mock de JwtService (no se usa en register, pero el constructor lo pide) —— //
class JwtServiceMock {
  generateToken = jest.fn();
  refreshToken = jest.fn();
}

describe('AuthService - register', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<UserEntity>>;
  let roleRepo: jest.Mocked<Repository<RoleEntity>>;
  let jwt: JwtServiceMock;

  beforeEach(() => {
    jest.clearAllMocks();

    userRepo = createRepoMock<UserEntity>();
    roleRepo = createRepoMock<RoleEntity>();
    jwt = new JwtServiceMock();

    service = new AuthService(userRepo as any, roleRepo as any, jwt as unknown as JwtService);
  });

  it('registra un usuario nuevo: verifica inexistencia, hashea, busca rol "user" y guarda', async () => {
    // arrange
    const dto = {
      email: 'ada@demo.com',
      password: 'Secr3t!',
      name: 'Ada',
      lastName: 'Lovelace',
    };

    // No existe usuario con ese email
    userRepo.findOne.mockResolvedValue(null as any);

    // Hasheo
    const hashed = 'hashed-password';
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue(hashed as any);

    // Rol por defecto
    const roleUser: RoleEntity = { id: 7, name: 'user' } as RoleEntity;
    roleRepo.findOne.mockResolvedValue(roleUser);

    // save “guarda” y devuelve con id
    userRepo.save.mockImplementation(async (u: any) => ({ id: 1, ...u }));

    // act
    const out = await service.register(dto as any);

    // assert
    // 1) verificó inexistencia por email
    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });

    // 2) hasheó con salt 10
    expect(bcrypt.hashSync).toHaveBeenCalledWith(dto.password, 10);

    // 3) guardó con mapeo correcto (nombre/apellido/roles/password hasheado)
    expect(userRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: dto.email,
        password: hashed,
        nombre: dto.name,
        apellido: dto.lastName,
        roles: [roleUser],
      }),
    );

    // 4) resultado incluye id y los campos mapeados
    expect(out).toEqual(
      expect.objectContaining({
        id: 1,
        email: dto.email,
        password: hashed,
        nombre: dto.name,
        apellido: dto.lastName,
      }),
    );
  });

  it('lanza ConflictException si el email ya existe (pre-chequeo)', async () => {
    const dto = {
      email: 'ada@demo.com',
      password: 'Secr3t!',
      name: 'Ada',
      lastName: 'Lovelace',
    };

    userRepo.findOne.mockResolvedValue({ id: 99, email: dto.email } as any);

    await expect(service.register(dto as any)).rejects.toBeInstanceOf(ConflictException);

    // No debería hashear ni guardar
    expect(bcrypt.hashSync).not.toHaveBeenCalled();
    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('lanza NotFoundException si el rol "user" no existe', async () => {
    const dto = {
      email: 'ada@demo.com',
      password: 'Secr3t!',
      name: 'Ada',
      lastName: 'Lovelace',
    };

    userRepo.findOne.mockResolvedValue(null as any);   // no existe usuario
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hash' as any);
    roleRepo.findOne.mockResolvedValue(null as any);   // no existe rol "user"

    await expect(service.register(dto as any)).rejects.toBeInstanceOf(NotFoundException);

    // No debería intentar guardar si falta el rol
    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('ante error del repositorio al guardar, lanza InternalServerErrorException', async () => {
    const dto = {
      email: 'ada@demo.com',
      password: 'Secr3t!',
      name: 'Ada',
      lastName: 'Lovelace',
    };

    userRepo.findOne.mockResolvedValue(null as any);
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('hash' as any);
    roleRepo.findOne.mockResolvedValue({ id: 7, name: 'user' } as RoleEntity);

    userRepo.save.mockRejectedValue(new Error('DB failed'));

    await expect(service.register(dto as any)).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});