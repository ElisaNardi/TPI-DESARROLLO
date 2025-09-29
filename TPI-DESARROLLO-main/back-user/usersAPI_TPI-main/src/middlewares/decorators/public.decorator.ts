//marcar algunas rutas como públicas

import { SetMetadata } from '@nestjs/common';

// Clave con la que el guard sabrá si la ruta es pública
export const IS_PUBLIC_KEY = 'isPublic';

// Decorador reutilizable que indica que una ruta es pública
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
