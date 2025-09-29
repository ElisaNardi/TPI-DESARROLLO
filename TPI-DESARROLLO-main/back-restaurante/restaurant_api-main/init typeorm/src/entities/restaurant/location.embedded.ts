import { Column } from 'typeorm';

// 📍 Clase para latitud y longitud
export class Location {
  @Column('float')
  lat: number;

  @Column('float')
  lng: number;
}
