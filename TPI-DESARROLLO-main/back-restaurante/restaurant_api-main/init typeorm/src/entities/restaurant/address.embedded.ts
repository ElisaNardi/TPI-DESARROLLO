import { Column } from 'typeorm';
import { Location } from './location.embedded';

// 🏠 Clase para calle, número y ubicación
export class Address {
  @Column()
  street: string;

  @Column()
  number: string;

  @Column(() => Location)
  location: Location;
}
