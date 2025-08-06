import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../entities/permission.entity';
import { CreatePermissionDTO } from '../interfaces/create-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,
  ) {}

  async create(dto: CreatePermissionDTO): Promise<PermissionEntity> {
    const permission = this.permissionRepo.create(dto);
    return await this.permissionRepo.save(permission);
  }

  async findAll(): Promise<PermissionEntity[]> {
    return await this.permissionRepo.find();
  }
}

