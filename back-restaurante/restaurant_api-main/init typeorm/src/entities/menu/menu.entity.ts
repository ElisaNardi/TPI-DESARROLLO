// src/entities/menu/menu.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Restaurant } from '../restaurant/restaurant.entity';

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Hacemos la descripción 'nullable' para que pueda ser opcional,
  // o le damos un valor por defecto si siempre debe ser un string.
  // Opción A (Recomendada): Permitir que sea nulo en la DB.
  @Column({ type: 'text', nullable: true })
  description: string;
  
  // Opción B: No permitir nulos.
  // @Column()
  // description: string;

  @Column('decimal')
  price: number;

  // Añadimos la columna para guardar el nombre de la categoría (ej. "Cafetería").
  // Podemos darle un valor por defecto si queremos.
  @Column({ default: 'General' })
  category: string;

   // Un ítem del menú pertenece a UN restaurante.
  @ManyToOne(() => Restaurant, restaurant => restaurant.menuItems)
  restaurant: Restaurant;
}
//Importante: Al modificar la entidad, si estás en un entorno de desarrollo con `synchronize: true` en tu `app.module.ts`, TypeORM debería intentar actualizar la tabla automáticamente. Si no, puede que necesites reiniciar la aplicación o manejar una migración
