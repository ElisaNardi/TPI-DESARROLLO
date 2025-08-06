import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { GlobalStatusService } from '../../services/global-status.service';

interface ProductData {
  name: string;
  description: string;
  price: number;
}

@Component({
  selector: 'app-gestionar-menu',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestionar-menu.component.html',
  styleUrls: ['./gestionar-menu.component.css']
})
export class GestionarMenuComponent implements OnInit {

  restaurantId!: number;
  menuForm!: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private globalStatus: GlobalStatusService
  ) {}

  ngOnInit(): void {
    this.restaurantId = +this.route.snapshot.paramMap.get('id')!;
    this.menuForm = this.fb.group({
      categories: this.fb.array([])
    });
    // Siempre intentamos cargar el menú existente al iniciar.
    this.loadExistingMenu();
  }

  // --- Método para Cargar Datos Existentes ---
  async loadExistingMenu(): Promise<void> {
    this.globalStatus.setLoading(true);
    try {
      // 1. Llama al endpoint GET /restaurant/:id/menu.
      const menuItems = await this.apiService.get(`/restaurant/${this.restaurantId}/menu`);
      
      // 2. Si la API devuelve datos, procedemos a rellenar el formulario.
      if (menuItems && menuItems.length > 0) {
        this.isEditMode = true;

        // 3. Agrupamos los productos por su categoría real.
        const groupedData = this.groupMenuByCategory(menuItems);

        // 4. Creamos la estructura del formulario (FormGroups y FormArrays) a partir de los datos.
        const categoryFormGroups = groupedData.map(category => {
          return this.fb.group({
            name: [category.name, Validators.required],
            products: this.fb.array(
              category.products.map(product => this.fb.group({
                name: [product.name, Validators.required],
                description: [product.description],
                price: [product.price, [Validators.required, Validators.min(0)]],
              }))
            )
          });
        });
        
        // 5. Reemplazamos el FormArray 'categories' vacío con la nueva estructura llena de datos.
        this.menuForm.setControl('categories', this.fb.array(categoryFormGroups));
      }
      // Si no hay datos, el formulario simplemente se queda vacío.
      
    } catch (error) {
      console.error("Error al cargar el menú para editar:", error);
    } finally {
      this.globalStatus.setLoading(false);
    }
  }
  
  // --- Métodos para Manipular el Formulario (añadir/quitar categorías y productos) ---
  get categories(): FormArray {
    return this.menuForm.get('categories') as FormArray;
  }
  newCategory(): FormGroup {
    return this.fb.group({ name: ['', Validators.required], products: this.fb.array([]) });
  }
  addCategory(): void {
    this.categories.push(this.newCategory());
  }
  removeCategory(categoryIndex: number): void {
    this.categories.removeAt(categoryIndex);
  }
  products(categoryIndex: number): FormArray {
    return this.categories.at(categoryIndex).get('products') as FormArray;
  }
  newProduct(): FormGroup {
    return this.fb.group({ name: ['', Validators.required], description: [''], price: [null, [Validators.required, Validators.min(0)]] });
  }
  addProduct(categoryIndex: number): void {
    this.products(categoryIndex).push(this.newProduct());
  }
  removeProduct(categoryIndex: number, productIndex: number): void {
    this.products(categoryIndex).removeAt(productIndex);
  }

  // --- Método para Enviar el Formulario  ---
  async onSubmit(): Promise<void> {
    if (this.menuForm.invalid) {
      this.menuForm.markAllAsTouched();
      return;
    }

    const formValue = this.menuForm.value;
    const productsToSave: any[] = [];
    formValue.categories.forEach((category: { name: string; products: any[] }) => {
      if (!category.name || category.products.length === 0) return;
      category.products.forEach((product: any) => {
        productsToSave.push({
          name: product.name, description: product.description, price: product.price,
          category: category.name, restaurantId: this.restaurantId,
        });
      });
    });

    try {
      this.globalStatus.setLoading(true);
      //  LÓGICA DE GUARDADO      
      // Gracias a nuestra lógica en el backend,no necesitamos saber si estamos creando o editando.
      // Siempre llamamos al mismo endpoint POST.
      await this.apiService.postData(`/restaurant/${this.restaurantId}/menu`, productsToSave);

      alert('¡El menú se ha guardado con éxito!');
      this.router.navigate(['/ver-restaurante', this.restaurantId]);

    } catch (error) {
      console.error("Error al guardar el menú:", error);
      alert('Hubo un problema al guardar el menú. Por favor, inténtalo de nuevo.');
    } finally {
      this.globalStatus.setLoading(false);
    }
  }
 
  // --- Función para Agrupar por Categoría ---
  private groupMenuByCategory(menuItems: any[]): { name: string, products: ProductData[] }[] {
    if (!menuItems || menuItems.length === 0) {
      return [];
    }
    const categoryMap = new Map<string, ProductData[]>();
    for (const item of menuItems) {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, []);
      }
      categoryMap.get(item.category)!.push(item);
    }
    return Array.from(categoryMap.entries()).map(([name, products]) => ({
      name,
      products,
    }));
  }
}