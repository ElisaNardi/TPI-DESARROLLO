import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { UserI } from '../interfaces/user.interface';
import { RoleEntity } from './role.entity';

@Entity('users')
export class UserEntity extends BaseEntity implements UserI {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column()
  email: string;

  @Index({ unique: true })
  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  password: string;

  @ManyToMany(() => RoleEntity, role => role.users, { eager: true })
  @JoinTable()
  roles: RoleEntity[];

  get permissionCodes(): string[] {
    return this.roles.flatMap(role => role.permissions.map(p => p.name));
  }
}


