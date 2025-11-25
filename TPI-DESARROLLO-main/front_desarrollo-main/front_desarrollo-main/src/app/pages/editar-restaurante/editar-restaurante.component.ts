// --- 1. IMPORTACIONES  ---
// Component: para crear el componente de Angular.
// OnInit / OnDestroy: interfaces para ejecutar lógica al iniciar y al destruir el componente.
// CommonModule: módulo básico de Angular (ngIf, ngFor, etc.).
// ReactiveFormsModule: para trabajar con formularios reactivos (FormGroup, FormControl, etc.).
// FormBuilder, FormGroup, Validators: utilidades para armar y validar formularios.
// ActivatedRoute: nos permite leer parámetros de la URL (por ejemplo, el id del restaurante).
// Router: para navegar entre rutas de la aplicación.
// ApiService: servicio propio que encapsula las llamadas HTTP al backend.
// GlobalStatusService: servicio propio para manejar título de página y estado de carga global.
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { GlobalStatusService } from '../../services/global-status.service';

@Component({
  selector: 'app-editar-restaurante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './editar-restaurante.component.html',
  styleUrls: ['./editar-restaurante.component.css']
})
export class EditarRestauranteComponent implements OnInit, OnDestroy {

  // --- 2. PROPIEDADES  ---
  restaurantId!: number;
  restaurantForm!: FormGroup;
  isLoading = true; 

 // --- 3. CONSTRUCTOR ---
  // Inyectamos todos los servicios que el componente necesita.
  constructor(
    private fb: FormBuilder,  // Para construir el formulario reactivo.
    private route: ActivatedRoute,// Para leer parámetros de la ruta (por ejemplo, /editar-restaurante/:id).
    private router: Router,// Para redirigir a otras rutas luego de guardar.
    private apiService: ApiService, // Servicio que hace las llamadas HTTP al backend.
    private globalStatusService: GlobalStatusService // Servicio que maneja título y estado global de carga.
  ) {
    this.restaurantForm = this.fb.group({
      name: ['', Validators.required],
      description: [
        '',
        [
          Validators.required, //  no puede estar vacío
          Validators.maxLength(200),  //  evita textos excesivamente largos.
          Validators.pattern(/^[^<>]*$/) //  expresión regular que SOLO permite caracteres
        ]
      ],
      city: ['', Validators.required],
      street: ['', Validators.required],
      number: ['', Validators.required],
      imageUrl: ['', Validators.required]
    });
  }


  // --- 4. ngOnInit  ---
  // ngOnInit  solo obtiene el ID y llama a la función de carga.
  ngOnInit(): void {
    this.restaurantId = +this.route.snapshot.paramMap.get('id')!;
    if (this.restaurantId) {
      this.loadRestaurantData();
    } else {
      // Si no hay ID, dejamos de cargar y mostramos un error.
      this.isLoading = false;
      this.globalStatusService.setPageTitle('ID no encontrado');
    }
  }

  //MÉTODO DE CARGA DE DATOS: ¡CORREGIDO! 
  async loadRestaurantData(): Promise<void> {
    // Ponemos el estado de carga en true al inicio.
    this.isLoading = true;
    this.globalStatusService.setLoading(true);

    try {
      // 1. Hacemos la llamada a la API UNA SOLA VEZ.
      const data = await this.apiService.get(`/restaurant/${this.restaurantId}`);
      
      // 2. Después de obtener los datos, actualizamos el título UNA SOLA VEZ.
      this.globalStatusService.setPageTitle(`Editar - ${data.name}`);

      // 3. Rellenamos el formulario UNA SOLA VEZ.
      this.restaurantForm.patchValue({
        name: data.name,
        description: data.description,
        city: data.city.name,
        street: data.address.street,
        number: data.address.number,
        imageUrl: data.imageUrl
      });
      
    } catch (error) {
      console.error('Error al cargar datos del restaurante:', error);
      this.globalStatusService.setPageTitle('Error al Editar');
    } finally {
      // 4. Al final de todo, dejamos de cargar.
      this.isLoading = false;
      this.globalStatusService.setLoading(false);
    }
  }

  // --- 6. GUARDADO DE DATOS  ---
  async onSubmit(): Promise<void> {
    if (this.restaurantForm.invalid) {
      this.restaurantForm.markAllAsTouched();
      return;
    }
    const formValue = this.restaurantForm.value;
    const dataToSave = {
      name: formValue.name, description: formValue.description, imageUrl: formValue.imageUrl,
      address: {
        street: formValue.street, number: formValue.number, cityName: formValue.city
      }
    };
    try {
      await this.apiService.updateData(`/restaurant/${this.restaurantId}`, dataToSave);
      alert('¡Restaurante actualizado con éxito!');
      this.router.navigate(['/restaurantes']);
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      alert('Hubo un problema al guardar los cambios.');
    }
  }

  // --- 7. LIMPIEZA AL SALIR ---
  ngOnDestroy(): void {
    // Al salir de esta página, restauramos el título para que no se quede
    this.globalStatusService.setPageTitle('Restaurantes');
  }
}