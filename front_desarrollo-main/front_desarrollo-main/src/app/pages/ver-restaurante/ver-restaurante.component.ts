// ver-restaurante.component.ts

// Importaciones necesarias de Angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para usar pipes como 'currency' y directivas como @for
import { ActivatedRoute, Router,RouterModule } from '@angular/router'; // Para manejar rutas y parámetros de URL
import { GlobalStatusService } from '../../services/global-status.service'; // Nuestro servicio de estado global
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

// --- INTERFACES PARA TIPADO  ---
interface Product {
  id: number; name: string; description: string; price: number;
}
interface MenuCategory {
  name: string; products: Product[];
}

@Component({
  selector: 'app-ver-restaurante',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ver-restaurante.component.html',
  styleUrls: ['./ver-restaurante.component.css']
})
export class VerRestauranteComponent implements OnInit, OnDestroy {

  // --- PROPIEDADES  ---
  restaurantId: number | null = null;
  restaurantName: string = '';
  menuCategories: MenuCategory[] = [];

  // --- CONSTRUCTOR  ---
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private globalStatusService: GlobalStatusService,
    private apiService: ApiService,
    public authService: AuthService
  ) {}

  // --- LÓGICA DE INICIALIZACIÓN  ---
  ngOnInit(): void {
    const idFromUrl = this.route.snapshot.paramMap.get('id');
    if (idFromUrl) {
      this.restaurantId = +idFromUrl;
      this.loadRestaurantData();
    }
  }

  //        FUNCIÓN DE CARGA DE DATOS
  /**
   * Este método hace UNA SOLA llamada a la API y procesa los datos correctamente.
   */
  async loadRestaurantData(): Promise<void> {
    if (!this.restaurantId) return;

    try {
      this.globalStatusService.setLoading(true);

      // 1. Obtenemos el restaurante, que ya incluye 'menuItems'.
      const restaurantData = await this.apiService.get(`/restaurant/${this.restaurantId}`);

      // 2. ASIGNAMOS EL NOMBRE: Extraemos el nombre del restaurante de la respuesta.
      this.restaurantName = restaurantData.name;
      this.globalStatusService.setPageTitle(this.restaurantName);
      
      // 3. Verificamos si la propiedad 'menuItems' existe y tiene contenido.
      if (restaurantData && restaurantData.menuItems && restaurantData.menuItems.length > 0) {
        
        // 4. PASAMOS LOS DATOS: Le pasamos la lista 'restaurantData.menuItems'
        //    a nuestra función para que los agrupe por su categoría.
        this.menuCategories = this.groupMenuByCategory(restaurantData.menuItems);
      
      } else {
        // 5. SI NO HAY MENÚ: Nos aseguramos de que el array esté vacío para mostrar el mensaje correcto.
        this.menuCategories = [];
      }

    } catch (error) {
      console.error("Error al cargar los datos del restaurante:", error);
      this.menuCategories = []; // En caso de error, también vaciamos el menú.
    } finally {
      this.globalStatusService.setLoading(false);
    }
  }
  

  //  MÉTODO  DE NAVEGACIÓN
  /**
   * Navega a la página de gestión del menú (que sirve tanto para añadir como para editar).
   */
  goToManageMenu(): void {
    if (this.restaurantId) {
      this.router.navigate(['/restaurante', this.restaurantId, 'gestionar-menu']);
    }
  }

  //  FUNCIÓN DE AGRUPACIÓN
  /**
   * Esta función agrupa los productos por su propiedad 'category'.
   * @param menuItems La lista de productos que viene de 'restaurantData.menuItems'.
   * @returns Un array de categorías, cada una con sus productos.
   */
  private groupMenuByCategory(menuItems: any[]): MenuCategory[] {
    // Si no hay ítems, devolvemos un array vacío.
    if (!menuItems || menuItems.length === 0) {
      return [];
    }

    // Usamos un Mapa para agrupar. La clave será el nombre de la categoría
    // y el valor será la lista de productos de esa categoría.
    const categoryMap = new Map<string, Product[]>();

    for (const item of menuItems) {
      // Si el mapa todavía no tiene esta categoría, la creamos con un array vacío.
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, []);
      }
      // Añadimos el producto actual al array de su categoría.
      categoryMap.get(item.category)!.push(item);
    }

    // convertimos el mapa de vuelta a un array, que es lo que el HTML necesita.
    return Array.from(categoryMap.entries()).map(([name, products]) => ({
      name,
      products,
    }));
  }

  ngOnDestroy(): void {
    this.globalStatusService.setPageTitle('Restaurantes');
  }
}