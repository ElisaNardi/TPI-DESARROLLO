// Este archivo es el punto de entrada principal de la aplicación Angular
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

// Importamos los proveedores necesarios para el ruteo y las peticiones HTTP
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app/app.routes'; // Tus rutas definidas

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(), // ✅ Activa HttpClient para poder usar servicios con Http
    provideRouter(routes) // ✅ Registra las rutas de navegación de la app
  ]
}).catch(err => console.error('❌ Error al iniciar la app:', err));
