import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';

// Mock de datos de ejemplo
const mockUsers = [
  { id: 1, name: 'Juan' },
  { id: 2, name: 'Ana' },
];

// Mock del repositorio o dependencias si es necesario
const mockRepository = {
  find: jest.fn().mockResolvedValue(mockUsers),
  findOne: jest.fn((id) => Promise.resolve(mockUsers.find(u => u.id === id))),
};

// Mock para RoleRepository (no se usa en estos tests, pero es requerido por el constructor)
const mockRoleRepository = {
  findOneBy: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let userRepository: typeof mockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: mockRepository },
        { provide: getRepositoryToken(RoleEntity), useValue: mockRoleRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(UserEntity));
  });

  // -------------------- CASO DE PRUEBA 1 --------------------
  // Verifica que findAll retorna la lista de usuarios
  it('debería retornar todos los usuarios', async () => {
    userRepository.find.mockResolvedValueOnce(mockUsers);
    const result = await service.findAll();
    expect(result).toEqual(mockUsers);
  });
  // ----------------------------------------------------------

  // -------------------- CASO DE PRUEBA 2 --------------------
  // Verifica que findOne retorna el usuario correcto por ID
  it('debería retornar el usuario correcto por ID', async () => {
    userRepository.findOne.mockImplementationOnce((options) => {
      // options: { where: { id }, relations: [...] }
      return Promise.resolve(mockUsers.find(u => u.id === options.where.id));
    });
    const result = await service.findOne(2);
    expect(result).toEqual({ id: 2, name: 'Ana' });
  });
  // ----------------------------------------------------------
});
