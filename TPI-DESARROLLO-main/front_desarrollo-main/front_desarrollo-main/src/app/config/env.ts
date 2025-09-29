// 📁 Archivo de configuración global de rutas para consumir APIs
// ✅ Se centralizan todas las URLs utilizadas por los servicios HTTP
export const config = {
  urls: {
    // 🌐 API de restaurantes y menú (microservicio en puerto 3000)
    baseUrl: 'http://localhost:3000',       // No se usa directamente, pero puede ser útil
    getFood: '/food',                       // Ruta para obtener lista de comidas (GET /food)
    getRestaurants: '/restaurants',         // Ruta para obtener restaurantes (GET /restaurants)

    // 🔐 API de autenticación (microservicio en puerto 4001)
    registerUser: 'http://localhost:4200/auth/register', // Endpoint para registrar usuario (POST)
    loginUser: 'http://localhost:4200/auth/login',       // Endpoint para login de usuario (POST)
  },
};
