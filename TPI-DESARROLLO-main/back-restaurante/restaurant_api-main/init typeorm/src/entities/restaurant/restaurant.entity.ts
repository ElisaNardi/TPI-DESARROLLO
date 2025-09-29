import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Menu } from '../menu/menu.entity'; 
import { Address } from './address.embedded';
import { City } from '../city/city.entity';

@Entity('restaurant')
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
  
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column(type => Address)
  address: Address;
  
  // Un restaurante puede tener MUCHOS ítems de menú.
  // La función 'menu => menu.restaurant' le dice a TypeORM que la
  // propiedad 'restaurant' en la entidad 'Menu' es la que nos une.
  @OneToMany(() => Menu, menu => menu.restaurant)
  menuItems: Menu[]; 

   // Un restaurante pertenece a UNA ciudad.
  @ManyToOne(() => City, city => city.restaurants)
  city: City;
}

