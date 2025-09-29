import { Controller, Post, Body, Param, UseGuards, Get } from '@nestjs/common';
import { MenuService, CreateMenuItemDto } from './menu.service';
import { AuthGuard } from '@nestjs/passport'; // O tu guard personalizado
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';


// Todas las rutas de este controlador empiezan con '/restaurant/:restaurantId/menu'.
@Controller('restaurant/:restaurantId/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  // --- Endpoint para GUARDAR/ACTUALIZAR el menú (peticiones POST) ---
  @Post()
  @Roles('admin') // Solo los administradores pueden acceder.
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  createOrUpdateMenu(
    @Param('restaurantId') restaurantId: string, // Extrae el ID de la URL.
    @Body() menuItems: CreateMenuItemDto[], // Extrae el array de productos del cuerpo de la petición.
  ) {
    // Llama al método 'bulkSave' del servicio para hacer el trabajo pesado.
    // El '+' convierte el 'restaurantId' de string a number.
    return this.menuService.bulkSave(+restaurantId, menuItems);
  }
  // --- Endpoint para OBTENER el menú de un restaurante (peticiones GET) ---
  /**
   * Este método estaba anidado incorrectamente dentro del anterior.
   * Ahora está a nivel de la clase y es un endpoint independiente.
   * Maneja la petición GET /restaurant/:restaurantId/menu
   */
  @Get()
  // No le ponemos guardias para que cualquier usuario (incluso no logueado)
  // pueda ver el menú de un restaurante.
  getMenuByRestaurantId(@Param('restaurantId') restaurantId: string) {
    // Llama al nuevo método 'findByRestaurant' que creamos en el servicio.
    return this.menuService.findByRestaurant(+restaurantId);
  }
}