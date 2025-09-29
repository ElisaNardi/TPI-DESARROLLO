// src/entities/index.ts
import { Address } from './restaurant/address.embedded';
import { Location } from './restaurant/location.embedded';
import { Restaurant } from './restaurant/restaurant.entity';
import { Menu } from './menu/menu.entity';
import { City } from './city/city.entity';

export const entities = [Restaurant, Menu, City];
export const embeddedEntities = [Address, Location];