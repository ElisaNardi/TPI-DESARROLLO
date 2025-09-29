import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Restaurant } from '../restaurant/restaurant.entity';

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  // Una ciudad puede tener MUCHOS restaurantes.
  // La propiedad que nos une es 'city' en la entidad Restaurant.
  @OneToMany(() => Restaurant, restaurant => restaurant.city)
  restaurants: Restaurant[];
}
