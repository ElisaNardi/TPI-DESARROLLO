// src/app/app.routes.ts

import { Routes } from '@angular/router';

// Importamos los componentes que forman parte del layout principal.
// Los que se cargan con 'loadComponent' no necesitan importarse aquí.
import { TemplateComponent } from './pages/template/template.component';
import { RestaurantsComponent } from './pages/restaurantes/restaurantes.component';
import { AgregarRestauranteComponent } from './pages/agregar-restaurante/agregar-restaurante.component';
import { EditarRestauranteComponent } from './pages/editar-restaurante/editar-restaurante.component';
import { VerRestauranteComponent } from './pages/ver-restaurante/ver-restaurante.component';
import { GestionarMenuComponent } from './pages/gestionar-menu/gestionar-menu.component';

import { authGuard } from './guards/auth.guard'; 
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // --- GRUPO 1: PÁGINAS PÚBLICAS (Lazy Loading) ---
  // Estas páginas se cargan solo cuando el usuario navega a ellas,
  // mejorando el tiempo de carga inicial de la aplicación.
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },

  // --- GRUPO 2: LAYOUT PRINCIPAL (TemplateComponent) CON SUS PÁGINAS "HIJAS" ---
  // Todas las rutas definidas en 'children' se renderizarán DENTRO del <router-outlet>
  // del TemplateComponent, manteniendo la barra de navegación y el menú lateral.
  {
    path: '',
    component: TemplateComponent,
    canActivate: [authGuard], // <--- PROTEGES TODO EL LAYOUT PRINCIPAL
    children: [
      { path: 'restaurantes', component: RestaurantsComponent }, 

      // RUTA PARA VER EL MENÚ DE UN RESTAURANTE (lo que tú llamas "ver-restaurante")
      // La ruta es '/ver-restaurante/5' (por ejemplo)
      // Esta es la ruta que se activará cuando el usuario haga clic en "Ingresar".
      { path: 'ver-restaurante/:id', component: VerRestauranteComponent },

      // --- RUTAS SOLO PARA ADMIN ---
      { path: 'restaurante/:id/gestionar-menu', // La URL que queremos activar.
        component: GestionarMenuComponent,       // El componente que se mostrará.
        canActivate: [adminGuard]              // El guardia que la protegerá.
      },
      { path: 'agregar-restaurante', component: AgregarRestauranteComponent, canActivate: [adminGuard] },
      { path: 'editar-restaurante/:id', component: EditarRestauranteComponent, canActivate: [adminGuard] },
      
      // Redirección por defecto DENTRO del layout.
      // Si el usuario está logueado pero no especifica una sub-ruta, se le lleva a la lista de restaurantes.
      { path: '', redirectTo: 'restaurantes', pathMatch: 'full' }
    ]
  },

  // --- GRUPO 3: REDIRECCIONES GLOBALES (se evalúan al final) ---
  // Si se entra a la raíz del sitio (ej. localhost:4200), se redirige a /home.
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  // Si ninguna de las rutas anteriores coincide, se redirige a /home.
  { path: '**', redirectTo: '/home' }
];