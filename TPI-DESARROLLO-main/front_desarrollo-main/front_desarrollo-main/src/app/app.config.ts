// Configuración global de la aplicación standalone
import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';

// 🧭 Router: definimos rutas y las registramos como provider
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// 📋 Formularios: tanto reactivos como template-driven
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// 🌐 Cliente HTTP para consumir APIs REST
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // ✅ Mejora el rendimiento de la detección de cambios al agrupar eventos
    provideZoneChangeDetection({ eventCoalescing: true }),

    // ✅ Importa las rutas definidas en app.routes.ts
    provideRouter(routes),

    // ✅ Registra el cliente HTTP como servicio inyectable (para HttpClient)
    provideHttpClient(),

    // ✅ Registra los módulos necesarios para usar formularios en cualquier componente
    importProvidersFrom(ReactiveFormsModule, FormsModule),
  ]
};
