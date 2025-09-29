import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';
import { AssignRoleDTO } from '../interfaces/assign-role.dto';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
  ) {}

  async findById(id: number): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { id },
      relations: ['roles'], // si querés traer roles junto con el usuario
    });
  }

  // Buscar usuario por email (para login o guards)
  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({
      where: { email },
    });
  }

  // Obtener todos los usuarios con sus roles
  async findAll(): Promise<UserEntity[]> {
    return this.userRepo.find({
      relations: ['roles'], // Incluye los roles en la respuesta
    });
  }

  // Asignar rol a un usuario
  async assignRole(userId: number, dto: AssignRoleDTO): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('User not found');

    const role = await this.roleRepo.findOneBy({ name: dto.roleName });
    if (!role) throw new NotFoundException('Role not found');

    user.roles = [...(user.roles || []), role];
    return this.userRepo.save(user);
  }
}
