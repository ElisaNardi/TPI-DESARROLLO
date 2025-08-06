import { Controller, Get,Post, Body, UseGuards } from '@nestjs/common';
import { PermissionService } from './permissions.service';
import { CreatePermissionDTO } from '../interfaces/create-permission.dto';
import { Permissions } from '../middlewares/decorators/permissions.decorator';
import { PermissionsGuard } from '../middlewares/permissions.guard';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @UseGuards(PermissionsGuard)
  @Permissions('permissions_create')
  @Post()
  create(@Body() dto: CreatePermissionDTO) {
    return this.permissionService.create(dto);
  }

  @Get()
  findAll() {
    return this.permissionService.findAll();
  }
}

