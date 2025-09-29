import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userRoles: string[] = [];

  constructor(private apiService: ApiService, private router: Router) {
    this.loadTokenData();
  }

  // La decodificación del token ya era correcta.
  private loadTokenData(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.userRoles = decodedToken.roles || [];
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        this.userRoles = [];
      }
    }
  }

  // El método de login ya era correcto.
  async login(credentials: any): Promise<any> {
    const response = await this.apiService.loginUser(credentials);
    if (response && response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      this.loadTokenData();
    }
    return response;
  }
  
  /**
   * Llama al ApiService para registrar un nuevo usuario.
   * @param userData Los datos del formulario de registro (nombre, email, etc.).
   */
  async register(userData: any): Promise<any> {
    // Simplemente pasamos la llamada a nuestro ApiService, que se encarga de la comunicación HTTP.
    return this.apiService.registerUser(userData);
  }

  // El método de logout ya era correcto.
  logout(): void {
    localStorage.removeItem('access_token');
    this.userRoles = [];
    this.router.navigate(['/login']);
  }

  // El método isAdmin ya era correcto.
  public isAdmin(): boolean {
    return this.userRoles.includes('admin');
  }
}

