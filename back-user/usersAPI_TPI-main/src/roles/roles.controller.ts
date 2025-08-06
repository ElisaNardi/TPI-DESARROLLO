import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RoleService } from './roles.service';
import { CreateRoleDTO } from '../interfaces/create-role.dto';
import { AssignPermissionDTO } from '../interfaces/assign-permission.dto';
import { Permissions } from '../middlewares/decorators/permissions.decorator';
import { PermissionsGuard } from '../middlewares/permissions.guard';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(PermissionsGuard)
  @Permissions('roles_create')
  @Post()
  create(@Body() dto: CreateRoleDTO) {
    return this.roleService.create(dto);
  }

  @UseGuards(PermissionsGuard)
  @Permissions('roles_assign_permissions')
  @Post(':id/permissions')
  assignPermission(@Param('id') roleId: number, @Body() dto: AssignPermissionDTO) {
    return this.roleService.assignPermission(roleId, dto);
  }

  @Get()
  findAll() {
    return this.roleService.findAll();
  }
}


