import { Component } from '@angular/core';
import { Router } from '@angular/router'; // ¡Importa el Router!

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  // Inyecta el Router en el constructor para poder usarlo
  constructor(private router: Router) {}

  // Esta es la función que llamamos desde el botón en el HTML
  goToLogin(): void {
    // Le decimos al router que navegue a la ruta '/login'
    this.router.navigate(['/login']);
  }
}