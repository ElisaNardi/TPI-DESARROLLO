// src/common/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';

// Definimos una clave única para guardar los metadatos de los roles.
export const ROLES_KEY = 'roles';

// Creamos nuestro decorador personalizado @Roles.
// Recibe un array de strings con los nombres de los roles permitidos (ej: 'admin', 'moderator').
// SetMetadata asocia este array de roles con la ruta donde se use el decorador.
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);