import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from '../entities/role.entity';
import { PermissionEntity } from '../entities/permission.entity';
import { Repository } from 'typeorm';
import { CreateRoleDTO } from '../interfaces/create-role.dto';
import { AssignPermissionDTO } from '../interfaces/assign-permission.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
  ) {}

  async create(dto: CreateRoleDTO) {
    const role = this.roleRepo.create(dto);
    return this.roleRepo.save(role);
  }

  async assignPermission(roleId: number, dto: AssignPermissionDTO) {
    const role = await this.roleRepo.findOneBy({ id: roleId });
    if (!role) throw new NotFoundException('Role not found');

    const permission = await this.permissionRepo.findOneBy({ name: dto.permissionName });
    if (!permission) throw new NotFoundException('Permission not found');

    role.permissions = [...(role.permissions || []), permission];
    return this.roleRepo.save(role);
  }

  async findAll() {
    return await this.roleRepo.find();
  }

}


