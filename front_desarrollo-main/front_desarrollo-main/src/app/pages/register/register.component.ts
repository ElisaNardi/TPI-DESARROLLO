// --- 1. IMPORTACIONES ---
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;

  // --- 2. INYECCIÓN DE DEPENDENCIAS ---
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  // --- 3. INICIALIZACIÓN DEL FORMULARIO ---
  ngOnInit(): void {
    // creación del formulario y la validación de contraseñas .
    this.registerForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { 
      validators: this.passwordMatchValidator
    });
  }

  // Validador personalizado para asegurar que las contraseñas coinciden.
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
  
  /**
   * Llama al AuthService para registrar al usuario y maneja la respuesta.
   */
  async onSubmit(): Promise<void> {
    // Si el formulario no es válido, detenemos la ejecución.
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    // Usamos try...catch para manejar el éxito o el fracaso de la llamada a la API.
    try {
      // 1. Obtenemos los datos del formulario (con nombres en español).
      const formData = this.registerForm.value;

      // 2. Creamos un nuevo objeto 'payload' y "traducimos" los nombres.
      const payload = {
        name: formData.nombre,       // La propiedad 'name' del DTO recibe el valor de 'nombre' del formulario.
        lastName: formData.apellido, // La propiedad 'lastName' del DTO recibe el valor de 'apellido'.
        email: formData.email,
        password: formData.password
      };
      
      // 3. Enviamos el 'payload' ya traducido a nuestro AuthService.
      await this.authService.register(payload);
      
      alert('¡Registro exitoso! Ya puedes iniciar sesión con tus credenciales.');
      this.router.navigate(['/login']);

    } catch (error: any) {
      console.error('Error en el registro:', error);
      const errorMessage = error.response?.data?.message || 'Hubo un problema con el registro.';
      // Si el backend devuelve un array de errores, los unimos.
      if (Array.isArray(errorMessage)) {
        alert(errorMessage.join(', '));
      } else {
        alert(errorMessage);
      }
    }
  }
  
  // Función de ayuda para el HTML, para mostrar errores.
  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }
}