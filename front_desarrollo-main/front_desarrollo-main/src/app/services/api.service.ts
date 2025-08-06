import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
// import { config } from '../config/env'; 

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Cliente Axios EXCLUSIVO para hablar con la API de Usuarios/Autenticación
  private axiosUser: AxiosInstance;
  
  // Cliente Axios EXCLUSIVO para hablar con la API de Restaurantes/Menús
  private axiosRestaurant: AxiosInstance;

  constructor() {
    // 1. Configuración del cliente de USUARIOS.
    this.axiosUser = axios.create({
      baseURL: 'http://localhost:4001', // PUERTO DE LA API DE USUARIOS
      headers: { 'Content-Type': 'application/json' },
    });

    // 2. Configuración del cliente de RESTAURANTES.
    this.axiosRestaurant = axios.create({
      baseURL: 'http://localhost:3001', // PUERTO DE LA API DE RESTAURANTES
      headers: { 'Content-Type': 'application/json' },
    });


    // 3. El interceptor de TOKEN solo se aplica al cliente de RESTAURANTES.
    this.axiosRestaurant.interceptors.request.use(
      (request) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          request.headers['Authorization'] = `Bearer ${token}`;
        }
        return request;
      },
      (error) => Promise.reject(error)
    );
  }

  // --- MÉTODOS DE AUTENTICACIÓN  ---

  // Llama a la API de usuarios para el login.
  async loginUser(data: any): Promise<any> {
    const response = await this.axiosUser.post('/auth/login', data);
    return response.data;
  }

  // Llama a la API de usuarios para el registro.
  async registerUser(data: any): Promise<any> {
    const response = await this.axiosUser.post('/auth/register', data);
    return response.data;
  }

  // --- MÉTODOS DE RESTAURANTES Y MENÚS ---

  // Método genérico para obtener datos de la API de restaurantes 
  async get(url: string): Promise<any> {
    console.log(`ApiService está haciendo una petición GET a: ${this.axiosRestaurant.getUri()}${url}`);
    const response = await this.axiosRestaurant.get(url);
    return response.data;
  }

  // Método genérico para enviar datos a la API de restaurantes 
  async postData(url: string, data: any): Promise<any> {
    const response = await this.axiosRestaurant.post(url, data);
    return response.data;
  }

  // Método genérico para eliminar datos en la API de restaurantes
  async deleteData(url: string): Promise<any> {
    const response = await this.axiosRestaurant.delete(url);
    return response.data;
  }

  // Método genérico para actualizar datos en la API de restaurantes
  async updateData(url: string, data: any): Promise<any> {
    const response = await this.axiosRestaurant.put(url, data);
    return response.data;
  }
}