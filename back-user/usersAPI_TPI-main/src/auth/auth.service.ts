// src/auth/auth.service.ts

// CAMBIO: Añadimos 'NotFoundException' a la lista de importaciones.
// Estas son las clases de NestJS para manejar errores HTTP estándar.
import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity'; // Importamos la entidad de Rol.
import { JwtService } from '../jwt/jwt.service';
import { RegisterDTO } from '../interfaces/register.dto';
import { LoginDTO } from '../interfaces/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // Inyectamos los repositorios para User y Role para poder interactuar con la base de datos.
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,

    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema.
   * Asigna el rol 'user' por defecto.
   */
  async register(dto: RegisterDTO): Promise<UserEntity> {
    // 1. Encripta la contraseña para no guardarla en texto plano.
    const hashedPassword = bcrypt.hashSync(dto.password, 10);

    // 2. Busca en la tabla 'roles' la fila donde el nombre sea 'user'.
    const defaultRole = await this.roleRepo.findOne({ where: { name: 'user' } });
    
    // 3. Si no encuentra ese rol, significa que la base de datos no está preparada.
    //    Lanza un error 404 (Not Found) para detener la operación.
    if (!defaultRole) {
      // Esta línea ahora funciona porque 'NotFoundException' fue importada.
      throw new NotFoundException('El rol por defecto "user" no fue encontrado. Asegúrese de que la base de datos esté inicializada (seeded).');
    }

    // 4. Crea una instancia del nuevo usuario con los datos proporcionados.
    const user = this.userRepo.create({
      email: dto.email,
      password: hashedPassword,
      nombre: dto.nombre,
      apellido: dto.apellido,
      // 5. Asigna el rol encontrado. La propiedad 'roles' espera un array.
      roles: [defaultRole], 
    });

    // 6. Guarda el usuario en la base de datos y devuelve la entidad creada.
    return await this.userRepo.save(user);
  }

  /**
   * Valida las credenciales de un usuario.
   */
  async validateUser(email: string, password: string): Promise<UserEntity> {
    // Busca un usuario por su email.
    // 'relations' le dice a TypeORM que también traiga los datos de las tablas relacionadas (roles y permisos).
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    // Compara la contraseña enviada con la contraseña encriptada de la base de datos.
    const isValid = user && bcrypt.compareSync(password, user.password);

    // Si el usuario no existe o la contraseña es incorrecta, lanza un error 401 (Unauthorized).
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  /**
   * Realiza el login y genera los tokens JWT.
   */
  async login(dto: LoginDTO) {
    // 1. Valida las credenciales.
    const user = await this.validateUser(dto.email, dto.password);

    // 2. Prepara los datos que irán dentro del token (el "payload").
    const roles = user.roles.map(role => role.name); // ej: ['user', 'admin']
    const permissionCodes = user.permissionCodes; // ej: ['create_restaurant']

    const payload = {
      id: user.id,
      email: user.email,
      roles: roles,
      permissionCodes,
    };

    // 3. Genera el token de acceso y el de refresco.
    const accessToken = this.jwtService.generateToken(payload, 'auth');
    const refreshToken = this.jwtService.generateToken(payload, 'refresh');

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Refresca un token de acceso usando un token de refresco.
   */
  refresh(refreshToken: string) {
    return this.jwtService.refreshToken(refreshToken);
  }
}