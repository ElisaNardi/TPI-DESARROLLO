import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
// jwt-decode es una pequeña librería para leer la información de un token JWT sin verificarlo.
// Instálala con: npm install jwt-decode
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Almacenará los roles del usuario una vez que inicie sesión.
  private userRoles: string[] = [];

  constructor(private apiService: ApiService, private router: Router) {
    // Al iniciar el servicio, intentamos cargar el token que ya pueda existir.
    this.loadToken();
  }

  /**
   * Intenta cargar el token desde localStorage y decodifica los roles.
   */
  private loadToken(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        // Decodificamos el token para extraer su contenido (el "payload").
        const decodedToken: any = jwtDecode(token);
        // Suponemos que tu token tiene una propiedad 'roles' que es un array de strings.
        this.userRoles = decodedToken.roles || [];
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        this.userRoles = [];
      }
    }
  }

  /**
   * Método de login. Guarda el token y carga los roles.
   */
  async login(credentials: any): Promise<any> {
    const response = await this.apiService.loginUser(credentials);
    if (response && response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      this.loadToken(); // ¡Crucial! Cargamos los roles justo después de iniciar sesión.
    }
    return response;
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    localStorage.removeItem('access_token');
    this.userRoles = []; // Limpiamos los roles.
    this.router.navigate(['/login']);
  }

  /**
   * Verifica si el usuario actual tiene el rol de 'admin'.
   * @returns true si el usuario es admin, false en caso contrario.
   */
  public isAdmin(): boolean {
    // Simplemente comprobamos si el array 'userRoles' incluye la palabra 'admin'.
    return this.userRoles.includes('admin');
  }
}