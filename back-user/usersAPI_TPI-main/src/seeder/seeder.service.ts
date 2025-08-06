// src/seeder/seeder.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PermissionEntity } from '../entities/permission.entity';
import { RoleEntity } from '../entities/role.entity';
import { UserEntity } from '../entities/user.entity';

import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepo: Repository<PermissionEntity>,

    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  // Este método se ejecuta automáticamente cuando se inicia el módulo.
  async onModuleInit() {
    console.log('--- Iniciando Seeding ---');
    await this.seedPermissions();
    await this.seedRoles(); // CAMBIO: Ahora este método creará ambos roles.
    await this.seedAdminUser();
    console.log('--- Seeding Completado ---');
  }

  /**
   * Crea un listado de permisos básicos si no existen.
   * (Esta función ya estaba perfecta, no se toca).
   */
  private async seedPermissions() {
    const permissions = [
      'get_users', 'create_users', 'update_users', 'delete_users',
      'roles_create', 'roles_assign_permissions',
    ];

    for (const perm of permissions) {
      const exists = await this.permissionRepo.findOne({ where: { name: perm } });
      if (!exists) {
        const newPermission = this.permissionRepo.create({ name: perm });
        await this.permissionRepo.save(newPermission);
        console.log(`✅ Permiso '${perm}' creado`);
      }
    }
  }

  /**
   * CAMBIO PRINCIPAL: Ahora este método crea tanto el rol 'admin' como el rol 'user'.
   * Asigna todos los permisos al rol 'admin'.
   */
  private async seedRoles() {
    // --- Creación del rol 'user' ---
    const userRoleExists = await this.roleRepo.findOne({ where: { name: 'user' } });
    if (!userRoleExists) {
      const userRole = this.roleRepo.create({ name: 'user', description: 'Rol de usuario regular' });
      await this.roleRepo.save(userRole);
      console.log(`✅ Rol 'user' creado`);
    }

    // --- Creación y asignación de permisos para el rol 'admin' ---
    let adminRole = await this.roleRepo.findOne({
      where: { name: 'admin' },
      relations: ['permissions'],
    });

    if (!adminRole) {
      adminRole = this.roleRepo.create({ name: 'admin', description: 'Rol de administrador' });
      await this.roleRepo.save(adminRole);
      console.log(`✅ Rol 'admin' creado`);
    }

    // Asignamos todos los permisos existentes al rol de admin
    const allPermissions = await this.permissionRepo.find();
    adminRole.permissions = allPermissions;
    await this.roleRepo.save(adminRole);
    console.log(`✅ Todos los permisos asignados al rol 'admin'`);
  }

  /**
   * Crea un usuario administrador si no existe y le asigna el rol 'admin'.
   * (Esta función ya estaba perfecta, no se toca).
   */
  private async seedAdminUser() {
    const adminUserExists = await this.userRepo.findOne({ where: { email: 'admin@admin.com' } });

    if (!adminUserExists) {
      const adminRole = await this.roleRepo.findOne({ where: { name: 'admin' } });
      if (!adminRole) {
        console.error("No se puede crear el usuario admin porque el rol 'admin' no existe.");
        return;
      }

      const hashedPassword = bcrypt.hashSync('admin123', 10); // Usa una contraseña un poco más segura

      const newAdminUser = this.userRepo.create({
        email: 'admin@admin.com',
        password: hashedPassword,
        nombre: 'Admin',
        apellido: 'System',
        roles: [adminRole], // Asigna el rol directamente en la creación
      });
      
      await this.userRepo.save(newAdminUser);
      console.log(`✅ Usuario admin creado (email: admin@admin.com, pass: admin123)`);
    }
  }
}