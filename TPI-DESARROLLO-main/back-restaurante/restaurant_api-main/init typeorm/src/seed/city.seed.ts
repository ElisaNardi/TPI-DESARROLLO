import { DataSource } from 'typeorm';
import { City } from '../entities/city/city.entity';

export const seedCities = async (dataSource: DataSource) => {
  const cityRepository = dataSource.getRepository(City);

  const cities = ['Villa María', 'Córdoba', 'Río Cuarto','Leones', 'Marcos Juarez', 'Bell Ville'];

  for (const name of cities) {
    const exists = await cityRepository.findOne({ where: { name } });
    if (!exists) {
      const city = cityRepository.create({ name });
      await cityRepository.save(city);
    }
  }

  console.log('Ciudades insertadas correctamente');
};
