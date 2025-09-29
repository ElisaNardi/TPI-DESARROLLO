// Importamos las herramientas necesarias.
import { Injectable } from '@angular/core';
// BehaviorSubject es un tipo de "Observable" que guarda el último valor emitido.
// Es perfecto para estados que cambian, como el título de una página.
import { BehaviorSubject, Observable } from 'rxjs'; 

@Injectable({
  providedIn: 'root', // Asegura que solo haya una instancia de este servicio en toda la app.
})
export class GlobalStatusService {
  // MANEJO DEL ESTADO DE CARGA (Spinner)
  // Un BehaviorSubject privado que guarda si la app está cargando (true) o no (false).
  private isLoading = new BehaviorSubject<boolean>(false);
  // La versión pública y de solo lectura. Los componentes se suscriben a este.
  public readonly isLoading$: Observable<boolean> = this.isLoading.asObservable();

  /**
   * Método público para que cualquier componente pueda activar o desactivar el spinner.
   * @param value El nuevo estado de carga (true o false).
   */
  public setLoading(value: boolean): void {
    this.isLoading.next(value);
  }


  // MANEJO DEL TÍTULO DE LA PÁGINA  
  // 1. Un BehaviorSubject privado que guarda el título actual.
  //    Lo inicializamos con el valor por defecto 'Restaurantes'.
  private pageTitle = new BehaviorSubject<string>('Restaurantes');
  
  // 2. La versión pública y observable del título.
  //    El componente de la cabecera (template) usará `(pageTitle$ | async)` para mostrarlo.
  public readonly pageTitle$: Observable<string> = this.pageTitle.asObservable();
  
  /**
   * Método público para que cualquier componente pueda cambiar el título de la cabecera.
   * @param title El nuevo texto que queremos mostrar.
   */
  public setPageTitle(title: string): void {
    // .next() emite el nuevo valor a todos los componentes que estén escuchando.
    this.pageTitle.next(title);
  }

  constructor() {} 
}