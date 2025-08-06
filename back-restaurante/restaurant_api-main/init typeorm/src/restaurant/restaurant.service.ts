import { Injectable, NotFoundException, BadRequestException  } from '@nestjs/common'; //  para manejar errores
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu/menu.entity';
import { Restaurant } from '../entities/restaurant/restaurant.entity';
import { City } from '../entities/city/city.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,

    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,

    @InjectRepository(City)
    private cityRepository: Repository<City>,
  ) {}

  /**
   * Crea un nuevo restaurante. Todos los campos que vienen del frontend.
   * @param data Los datos enviados desde el formulario de Angular.
   */
  async create(data: any): Promise<Restaurant> {
    // 1. Validación de entrada: Nos aseguramos de que los datos mínimos existan.
    if (!data.name || !data.address || !data.address.cityName) {
      throw new BadRequestException('Faltan campos requeridos: nombre o dirección completa.');
    }

    // 2. Lógica de la Ciudad: Buscamos si la ciudad ya existe.
    const cityName = data.address.cityName;
    let city = await this.cityRepository.findOne({ where: { name: cityName } });

    // Si no existe, la creamos y guardamos.
    if (!city) {
      city = this.cityRepository.create({ name: cityName });
      await this.cityRepository.save(city);
    }

    // 3. Creamos la nueva entidad 'Restaurant'
    //    asegurándonos de mapear TODOS los campos que existen en la entidad.
    const newRestaurant = this.restaurantRepository.create({
      name: data.name,
      description: data.description, 
      imageUrl: data.imageUrl,
      // Construimos el objeto 'address' anidado tal como lo define la entidad.
      address: {
        street: data.address.street,
        number: data.address.number,
        // Inicializamos 'location' con valores por defecto o nulos si es necesario.
        // TypeORM espera que este objeto exista.
        location: {
          lat: 0, // Puedes poner 0 como valor por defecto
          lng: 0  // O null si la entidad lo permite
        }
      },
      // Asignamos la relación con la entidad 'City' que encontramos o creamos.
      city: city,
    });

    // 4. Guardamos la entidad completa en la base de datos.
    return this.restaurantRepository.save(newRestaurant);
  }

 
  findAll() {
    // Al hacer 'find', TypeORM devuelve todos los restaurantes.
    // Si la relación 'city' en la entidad Restaurant tiene `eager: true`, la traerá automáticamente.
    return this.restaurantRepository.find({ relations: ['city'] });
  }


  /**
   * Busca UN solo restaurante por su ID.
   * Además, carga sus ítems de menú asociados.
   * @param id El ID del restaurante a buscar.
   * @returns El objeto del restaurante con su menú incluido.
   */
  async findOne(id: number) {
    // 1. Usamos el método 'findOne' del repositorio.
    //    Nos permite pasar un objeto de configuración con más opciones.
    const restaurant = await this.restaurantRepository.findOne({
      // 2. 'where' es la condición de búsqueda. Le decimos: "busca donde el 'id' sea igual al que te paso".
      where: { id: id },
      
      // 3. 'relations' es un array de strings donde especificamos
      //    qué relaciones queremos que TypeORM cargue junto con la entidad principal.
      //    'menuItems' debe ser el nombre exacto de la propiedad en tu `Restaurant.entity.ts`
      //    que tiene el decorador `@OneToMany`.
      relations: ['menuItems', 'city'], // Le pedimos que cargue el menú y la ciudad.
    });

    // 4.  verificar si la búsqueda encontró algo.
    //    Si no se encontró ningún restaurante con ese ID, lanzamos un error claro.
    if (!restaurant) {
      throw new NotFoundException(`Restaurante con ID #${id} no encontrado.`);
    }

    // 5. Devolvemos el objeto 'restaurant'. Gracias a la opción 'relations',
    //    este objeto  no solo tiene 'id', 'name', etc., sino también
    //    una propiedad 'menuItems' que es un array con todos los productos del menú.
    return restaurant;
  }

  /**
   * Actualiza un restaurante existente.
   * La lógica ahora busca primero el restaurante, actualiza sus campos
   * y luego lo guarda, manejando correctamente las relaciones.
   * @param id El ID del restaurante a actualizar.
   * @param data Los nuevos datos del restaurante.
   */
  async update(id: number, data: any): Promise<Restaurant> {
    // 1. Buscamos el restaurante que vamos a actualizar, incluyendo su relación 'city'.
    const restaurantToUpdate = await this.restaurantRepository.findOne({ 
      where: { id },
      relations: ['city'] 
    });
    if (!restaurantToUpdate) {
      throw new NotFoundException(`No se pudo encontrar el restaurante con ID ${id} para actualizar.`);
    }

    // 2. Manejamos la lógica de la ciudad, igual que en el método 'create'.
    if (data.address && data.address.cityName) {
      let city = await this.cityRepository.findOne({ where: { name: data.address.cityName } });
      if (!city) {
        city = this.cityRepository.create({ name: data.address.cityName });
        await this.cityRepository.save(city);
      }
      // Asignamos la entidad 'City' completa a la propiedad 'city' del restaurante.
      restaurantToUpdate.city = city;
    }

    // 3. Usamos 'Object.assign' para fusionar los datos nuevos con los existentes.
    //    Actualizamos las propiedades principales.
    Object.assign(restaurantToUpdate, {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
    });
    // Actualizamos las propiedades anidadas de 'address'.
    if(data.address) {
        restaurantToUpdate.address.street = data.address.street;
        restaurantToUpdate.address.number = data.address.number;
    }


    // 4. Guardamos la entidad 'restaurantToUpdate' completa.
    return this.restaurantRepository.save(restaurantToUpdate);
  }

  async remove(id: number) {
    await this.restaurantRepository.delete(id);
    return { message: 'deleted' };
  }
  
  // Método para obtener el menú de un restaurante por su ID.
  async getMenusByRestaurantId(id: number) {
    return this.menuRepository.find({
      where: { restaurant: { id } },
    });
  }
}