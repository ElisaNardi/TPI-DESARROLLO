/**
Pregunta que responde: "Ok, ya sé que has iniciado sesión... pero, ¿tienes permiso para entrar a esta sala VIP? ¿Eres administrador?"
Cómo lo hace: Usa el authService.isAdmin() para verificar el rol del usuario.
Resultado:
Si SÍ es admin (true): Permite el acceso.
Si NO es admin (false): Bloquea el acceso y te redirige a una página segura (como /restaurantes), impidiendo que un usuario común acceda a funciones de administrador.
Este guardia se usa para proteger rutas específicas y muy sensibles, como /agregar-restaurante, /editar-restaurante/:id.
 */


import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guardia de Autorización: Verifica si el usuario autenticado tiene rol de 'admin'.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    // Si es admin, permitimos el paso a la ruta protegida.
    return true;
  } 
  
  // Si no es admin, lo redirigimos a la lista principal y bloqueamos la ruta.
  router.navigate(['/restaurantes']);
  return false;
};