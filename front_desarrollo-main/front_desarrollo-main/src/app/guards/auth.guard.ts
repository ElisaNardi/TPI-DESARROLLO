/***
 * Proteger las rutas: Impide que el usuario acceda a ciertas rutas si no tiene token.
 * auth.guard.ts (Tu Guardia de AUTENTICACIÓN)
Pregunta que responde: "¿El usuario ha iniciado sesión?"
Cómo lo hace: Revisa si localStorage.getItem('access_token') existe.
Resultado:
Si SÍ hay token (true): Permite el acceso. ¡Pero no le importa si eres admin o un cliente! Solo sabe que estás "dentro del sistema".
Si NO hay token (false): Bloquea el acceso y te redirige a /login.
***/


import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

/**
 * Guardia de Autenticación: Verifica si el usuario ha iniciado sesión.
 */
//LA CONSTANTE A 'authGuard' PARA QUE SEA CLARA Y EXPORTABLE
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (token) {
    // Si hay token, el usuario está autenticado. Permitimos el paso.
    return true;
  }

  // Si no hay token, lo redirigimos a la página de login y bloqueamos la ruta.
  router.navigate(['/login']);
  return false;
};