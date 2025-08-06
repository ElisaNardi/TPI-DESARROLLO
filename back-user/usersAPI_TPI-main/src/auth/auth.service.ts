import { Injectable, UnauthorizedException, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { RoleEntity } from '../entities/role.entity';
import { JwtService } from '../jwt/jwt.service';
import { RegisterUserDto } from './dto/register-user.dto'; 
import { LoginDTO } from '../interfaces/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo usuario.
   */
 async register(registerUserDto: RegisterUserDto): Promise<UserEntity> {
    // a. Extraemos los datos del DTO 
    const { email, password, name, lastName } = registerUserDto;

    // b. Verificamos si el email ya existe para evitar duplicados.
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está en uso.');
    }

    // c. Encriptamos la contraseña. !
    const hashedPassword = bcrypt.hashSync(password, 10);

    // d. Buscamos el rol 'user' que se asignará por defecto a los nuevos usuarios.
    const defaultRole = await this.roleRepo.findOne({ where: { name: 'user' } });
    if (!defaultRole) {
      throw new NotFoundException('El rol "user" no fue encontrado. Asegúrese de que el seeder de roles se haya ejecutado.');
    }

    // e. Creamos una nueva instancia de la entidad.
    //    Usamos 'new UserEntity()' para tener control total y evitar errores de tipo.
    const newUser = new UserEntity();
    
    // f. Asignamos CADA propiedad explícitamente, haciendo el "mapeo".
    newUser.email = email;
    newUser.password = hashedPassword;
    // La propiedad 'nombre' (entidad) recibe el valor de 'name' (del DTO).
    newUser.nombre = name;
    // La propiedad 'apellido' (entidad) recibe el valor de 'lastName' (DTO).
    newUser.apellido = lastName;
    // Asignamos el rol que encontramos.
    newUser.roles = [defaultRole];

    // g. Guardamos la nueva entidad
    try {
      return await this.userRepo.save(newUser);
    } catch (error) {
      console.error(error); 
      throw new InternalServerErrorException('Error al guardar el usuario en la base de datos.');
    }
  }
  /**
   * Valida las credenciales del usuario.
   */
  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
    const isValid = user && bcrypt.compareSync(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    // Borramos la contraseña antes de devolver el objeto usuario.
    delete user.password;
    return user;
  }
  async login(dto: LoginDTO) {
    const user = await this.validateUser(dto.email, dto.password);
    const roles = user.roles.map(role => role.name);
    const permissionCodes = user.permissionCodes;
    const payload = {
      id: user.id,
      email: user.email,
      roles: roles,
      permissionCodes,
    };
    const accessToken = this.jwtService.generateToken(payload, 'auth');
    const refreshToken = this.jwtService.generateToken(payload, 'refresh');
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  refresh(refreshToken: string) {
    return this.jwtService.refreshToken(refreshToken);
  }
}
