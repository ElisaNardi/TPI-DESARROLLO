===========================================
INSTRUCCIONES PARA LEVANTAR EL PROYECTO
===========================================

-------------------------------------------
 1. LEVANTAR LA BASE DE DATOS CON DOCKER
-------------------------------------------

1.1 Asegurate de tener Docker instalado y abierto.
1.2 Ir a la carpeta donde está el archivo docker-compose.yml
     Por ejemplo: 
     → cd TPI/back-restaurante/restaurant_api-main

1.3 Ejecutar:
     → docker compose up -d

Esto levantará PostgreSQL en segundo plano en el puerto 5433.

------------------------------------------
 2. LEVANTAR EL BACKEND DE USUARIOS (NestJS)
------------------------------------------

2.1 Ir a la carpeta del backend de usuarios:
     → cd TPI/back-user/usersAPI_TPI-main

2.2 Instalar dependencias:
     → npm install

2.3 Ejecutar el servidor:
     → npm run start:dev

Asegurate de que el archivo `.env` tenga las variables correctas para conectar a PostgreSQL.

------------------------------------------
 3. LEVANTAR EL BACKEND DE RESTAURANTES (NestJS)
------------------------------------------

3.1 Ir a la carpeta del backend de restaurantes:
     → cd TPI/back-restaurante/restaurant_api-main

3.2 Instalar dependencias:
     → npm install

3.3 Ejecutar el servidor:
     → npm run start:dev

 También asegurate de que tenga bien configurado el archivo `.env` o las variables TypeORM.

------------------------------------------
 4. LEVANTAR EL FRONTEND (Angular)
------------------------------------------

4.1 Ir a la carpeta raíz del frontend Angular:
     → cd TPI/front_desarrollo-main/front_desarrollo-main

4.2 Instalar dependencias:
     → npm install

4.3 Ejecutar Angular:
     → ng serve

Esto abrirá el sitio en http://localhost:4200

------------------------------------------
 TIPS EXTRAS
------------------------------------------
Si `ng serve` da error de CLI, instalala globalmente:
     → npm install -g @angular/cli

 Si necesitás resetear la base de datos:
     → docker compose down -v
     → docker compose up -d

------------------------------------------------------

**localhost:4200** → es el frontend, o sea Angular.

**localhost:4001** → es el backend, o sea NestJS (API).

------------------------------------------------------

Ejectuar spects:
user.service.spects.ts: npx jest --verbose --runInBand src/users/users.service.spec.ts
auth.service.spect.ts: npx jest --verbose --runInBand src/auth/auth.service.spec.ts
menu.serve.spects.ts: npm test
