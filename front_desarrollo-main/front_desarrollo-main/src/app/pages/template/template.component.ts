import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { GlobalStatusService } from '../../services/global-status.service'; 
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css'],
})
export class TemplateComponent {
  
  // --- PROPIEDADES DE ESTADO  ---
  menuAbierto = false; // Solo necesitamos saber si el menú principal está abierto o no.
  
  public pageTitle$: Observable<string>;

  // --- CONSTRUCTOR  ---
  constructor(
    public globalStatusService: GlobalStatusService,
    public authService: AuthService
  ) {
    this.pageTitle$ = this.globalStatusService.pageTitle$;
  }

  // --- MÉTODOS DE INTERACTIVIDAD   ---
  // Cambia el estado de 'menuAbierto'. Si está abierto, lo cierra, y viceversa.
  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }
}