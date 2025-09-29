import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { AssignRoleDTO } from '../interfaces/assign-role.dto';
import { Permissions } from '../middlewares/decorators/permissions.decorator';
import { PermissionsGuard } from '../middlewares/permissions.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Obtener todos los usuarios
  @Get()
  @UseGuards(PermissionsGuard)
  @Permissions('users_read')
  findAll() {
    return this.userService.findAll();
  }

  // Asignar roles a un usuario
  @UseGuards(PermissionsGuard)
  @Permissions('users_assign_roles')
  @Post(':id/roles')
  assignRole(@Param('id') userId: number, @Body() dto: AssignRoleDTO) {
    return this.userService.assignRole(userId, dto);
  }

  
}



