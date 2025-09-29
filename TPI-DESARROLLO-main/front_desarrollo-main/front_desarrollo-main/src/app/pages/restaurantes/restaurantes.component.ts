// --- 1. IMPORTACIONES ---
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-restaurantes',
  templateUrl: './restaurantes.component.html',
  styleUrls: ['./restaurantes.component.css']
})
export class RestaurantsComponent implements OnInit {

  // --- 2. PROPIEDADES ---
  // Almacenará la lista de restaurantes. Se inicializa vacía.
  restaurants: any[] = [];

  private backendUrl = 'http://localhost:3001'; // URL del backend

  // --- 3. INYECCIÓN DE DEPENDENCIAS ---
  // Pedimos a Angular los servicios que necesitamos.
  constructor(
    private router: Router,
    private apiService: ApiService,
    // 'public' permite que el HTML acceda a los métodos de authService (ej. isAdmin()).
    public authService: AuthService 
  ) {}

  // --- 4. LÓGICA DE INICIALIZACIÓN ---
  // ngOnInit se ejecuta cuando el componente está listo.
  ngOnInit(): void {
    // Llamamos al método para cargar los datos.
    this.loadRestaurants();
  }

async loadRestaurants(): Promise<void> {
    try {
      // 1. Obtenemos los datos crudos de la API.
      const data = await this.apiService.get('/restaurant');
      // 2. Antes de guardar los datos, recorremos la lista con '.map()' para transformar cada restaurante.
      this.restaurants = data.map((restaurant: any) => {
        // 3. Creamos una nueva propiedad 'fullImageUrl' construyendo la URL completa.
        //    Nos aseguramos de que imageUrl exista para no tener errores.
        if (restaurant.imageUrl) {
          // Si la URL ya es completa (empieza con http), la usamos tal cual.
          if (restaurant.imageUrl.startsWith('http')) {
            restaurant.fullImageUrl = restaurant.imageUrl;
          } else {
            // Si es una ruta relativa (ej. /uploads/...), le añadimos la URL del backend.
            restaurant.fullImageUrl = `${this.backendUrl}${restaurant.imageUrl}`;
          }
        } else {
          // Si no hay imagen, le ponemos una imagen por defecto.
          restaurant.fullImageUrl = 'https://via.placeholder.com/300x200.png?text=Sin+Imagen';
        }
        return restaurant;
      });

    } catch (error) {
      console.error('Error al cargar la lista de restaurantes:', error);
    }
  }

  // --- 5. MÉTODOS DE INTERACCIÓN ---
  // Navega a la vista pública del menú.
  verRestaurante(id: number): void {
    this.router.navigate(['/ver-restaurante', id]); 
  }

  // (Admin) Navega al formulario para editar el restaurante.
  editarRestaurante(id: number): void {
    this.router.navigate(['/editar-restaurante', id]); 
  }
  
  // (Admin) Navega a la página para gestionar el menú.
  gestionarMenu(id: number): void {
    this.router.navigate(['/restaurante', id, 'gestionar-menu']);
  }

  // (Admin) Elimina un restaurante.
  async eliminarRestaurante(id: number): Promise<void> {
    if (confirm('¿Estás seguro de que deseas eliminar este restaurante?')) {
      try {
        await this.apiService.deleteData(`/restaurant/${id}`);
        // Actualiza la lista en el frontend para que el cambio sea instantáneo.
        this.restaurants = this.restaurants.filter(r => r.id !== id);
      } catch (error) {
        console.error('Error al eliminar el restaurante:', error);
      }
    }
  }
}