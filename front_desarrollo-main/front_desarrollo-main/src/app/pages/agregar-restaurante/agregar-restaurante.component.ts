// --- 1. IMPORTACIONES ---
// Importamos todo lo que necesitamos de Angular y nuestros servicios.
import { Component, OnInit, OnDestroy } from '@angular/core'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalStatusService } from '../../services/global-status.service';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-agregar-restaurante',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agregar-restaurante.component.html',
  styleUrls: ['./agregar-restaurante.component.css']
})
export class AgregarRestauranteComponent implements OnInit, OnDestroy {
  // --- 2. PROPIEDADES ---
  addRestaurantForm!: FormGroup;

  // --- 3. CONSTRUCTOR  ---
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private globalStatusService: GlobalStatusService,
    private apiService: ApiService
  ) {}

  // --- 4. ngOnInit - Lógica de Inicializació) ---
  ngOnInit(): void {
    // 1. Usamos setTimeout para "desacoplar" el cambio de título del ciclo de
    //    detección de cambios inicial de Angular.
    setTimeout(() => {
      // 2. Esta línea ahora se ejecutará un instante después de que Angular haya
      //    terminado de dibujar la vista, evitando el error ExpressionChangedAfterItHasBeenCheckedError.
      this.globalStatusService.setPageTitle('Añadir Restaurante');
    }, 0); // 0 milisegundos es suficiente para que funcione.

    // La creación del formulario se queda igual, es correcta.
    this.addRestaurantForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', Validators.maxLength(200)],
      imagenUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      address: this.fb.group({
        ciudad: ['', Validators.required],
        calle: ['', Validators.required],
        numero: ['', Validators.required]
      })
    });
  }


  // --- 5. onSubmit - Manejo del Envío del Formulario ---
  /**
   * Se ejecuta al enviar el formulario.
   * Valida los datos y los envía a la API en el formato correcto.
   */
  async onSubmit(): Promise<void> {
    
    // Si el formulario no cumple las validaciones, mostramos los errores y nos detenemos.
    if (this.addRestaurantForm.invalid) {
      this.addRestaurantForm.markAllAsTouched();
      return; 
    }

    // Obtenemos los valores del formulario.
    const formData = this.addRestaurantForm.value;

    // Creamos el objeto 'payload' con la estructura EXACTA que el backend espera.
    const payload = {
      name: formData.nombre,
      description: formData.descripcion,
      imageUrl: formData.imagenUrl,
      address: {
        street: formData.address.calle,
        number: formData.address.numero,
        cityName: formData.address.ciudad
      }
    };
    
    // Usamos 'try...catch' para manejar la comunicación con la API.
    try {
      this.globalStatusService.setLoading(true); // Activamos el spinner.
      console.log('Enviando datos a la API:', payload); 

      // Llamamos al servicio para hacer la petición POST a la ruta '/restaurant'.
      await this.apiService.postData('/restaurant', payload);
      
      // Si la llamada fue exitosa, mostramos una alerta y navegamos.
      alert('¡Restaurante creado con éxito!');
      this.router.navigate(['/restaurantes']);

    } catch (error) {
      // Si la API devuelve un error, lo capturamos.
      console.error('Error al crear el restaurante:', error);
      alert('Hubo un problema al crear el restaurante. Por favor, revisa los datos.');
    } finally {
      this.globalStatusService.setLoading(false); // Desactivamos el spinner, tanto en éxito como en error.
    }
  }

  // --- 6. ngOnDestroy - Limpieza ---
  // Al salir de esta página, restauramos el título.
  ngOnDestroy(): void {
    this.globalStatusService.setPageTitle('Restaurantes');
  }
}