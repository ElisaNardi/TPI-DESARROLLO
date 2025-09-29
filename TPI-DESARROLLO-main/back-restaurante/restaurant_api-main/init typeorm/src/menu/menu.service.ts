import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Menu } from '../entities/menu/menu.entity';
import { Restaurant } from '../entities/restaurant/restaurant.entity';

// --- DTO (Data Transfer Object) ---
// Define la estructura de datos que esperamos del frontend.
export class CreateMenuItemDto {
  name: string;
  description: string;
  price: number;
  category: string;
}

@Injectable()
export class MenuService {
  
  // --- Inyección de Dependencias ---
  // NestJS nos proporciona las herramientas para hablar con la base de datos.
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly dataSource: DataSource,
  ) {}

  
  // --- Método para Guardar/Actualizar el Menú ---
  // Esta lógica de "borrar y reemplazar" es robusta y funciona tanto para crear como para actualizar.
  async bulkSave(restaurantId: number, menuItems: CreateMenuItemDto[]) {
    // Usamos una transacción para asegurar que todas las operaciones se completen, o ninguna.
    return this.dataSource.transaction(async (entityManager) => {
      // 1. Verificamos que el restaurante exista.
      const restaurant = await entityManager.findOneBy(Restaurant, { id: restaurantId });
      if (!restaurant) {
        throw new NotFoundException(`Restaurante con ID ${restaurantId} no encontrado.`);
      }

      // 2. Borramos TODOS los ítems de menú antiguos asociados a este restaurante.
      await entityManager.delete(Menu, { restaurant: { id: restaurantId } });

      // Si la lista de nuevos ítems está vacía, terminamos aquí.
      if (!menuItems || menuItems.length === 0) {
        return { message: 'Menú del restaurante vaciado con éxito.' };
      }

      // 3. Convertimos los datos simples del DTO en entidades completas de TypeORM.
      const newMenuEntities = menuItems.map(itemDto => {
        const newItem = new Menu();
        newItem.name = itemDto.name;
        newItem.description = itemDto.description;
        newItem.price = itemDto.price;
        newItem.category = itemDto.category;
        newItem.restaurant = restaurant; // Vinculamos cada ítem con su restaurante.
        return newItem;
      });

      // 4. Guardamos todas las nuevas entidades en la base de datos de una sola vez.
      const savedItems = await entityManager.save(Menu, newMenuEntities);
      return savedItems;
    });
  }

  // --- Método para Buscar el Menú por Restaurante ---
  /**
   * Busca y devuelve todos los ítems de menú que pertenecen a un restaurante específico.
   * Este es el método que el 'MenuController' usará para las peticiones GET.
   * @param restaurantId El ID del restaurante del cual queremos obtener el menú.
   * @returns Una promesa que se resuelve en un array de ítems del menú.
   */
  async findByRestaurant(restaurantId: number): Promise<Menu[]> {
    // Usamos el repositorio de 'Menu' para buscar múltiples registros ('find').
    return this.menuRepository.find({
      // La condición 'where' filtra los resultados.
      where: {
        // Le pedimos que nos dé los menús donde la relación 'restaurant'...
        restaurant: {
          // ...tenga un 'id' que coincida con el que nos pasaron.
          id: restaurantId,
        },
      },
      // Ordenamos los resultados para una visualización consistente.
      order: {
        category: 'ASC',
        name: 'ASC',
      }
    });
  }
}