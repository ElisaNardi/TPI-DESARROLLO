import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  // Inyectamos ApiService para la llamada HTTP y AuthService para el estado
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private apiService: ApiService,

    // AuthService es el servicio que creamos que tiene el método isAdmin()
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }
  /**
   * Este método ahora es asíncrono y usa try/catch para manejar la Promesa
   * que devuelve el servicio de API.
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    // 2. Usamos un bloque try...catch para manejar el éxito y el error.
    try {
      // 3. 'await' pausa la ejecución aquí y espera a que la Promesa de 'login' se resuelva.
      //    Llamamos al método de login que está en nuestro AuthService.
      await this.authService.login(this.loginForm.value);
      
      // 4. Si la línea anterior NO lanzó un error, significa que el login fue exitoso.
      //    Ahora podemos redirigir al usuario.
      this.router.navigate(['/restaurantes']);

    } catch (error: any) { // 5. Le decimos a TypeScript que 'error' puede ser de cualquier tipo ('any').
      // 6. Si 'await' falló (la Promesa fue rechazada), el código salta a este bloque 'catch'.
      console.error('❌ Login fallido:', error);
      alert('Credenciales incorrectas');
    }
  }

  /**
   * Este método es llamado por el botón "Registrarse" en el HTML.
   * Simplemente navega a la ruta '/register'.
   */
  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}