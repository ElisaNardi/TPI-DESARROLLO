// src/entities/menu/menu.entity.ts
// src/entities/menu/menu.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, Index} from 'typeorm';
import { Restaurant } from '../restaurant/restaurant.entity';

@Unique(['restaurantId', 'name'])          // <- evita duplicados en BD
@Index(['restaurantId', 'name'])           // <- ayuda a las búsquedas
@Entity({ name: 'menu' })
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  // Tu BD hoy tiene double precision; mantenelo para no pelear con migraciones.
  @Column({ type: 'double precision', default: 0 })
  price: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: 'General' })
  category: string;

  // Columna FK explícita (nos deja usar where por ID sin cargar la relación)
  @Column()
  restaurantId: number;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;
}
