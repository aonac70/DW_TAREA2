/**
 * Punto de entrada de la API (GET /api): describe el servicio y sus rutas,
 * útil para quien abre la URL base en el navegador.
 */
import { responderOk } from '../utils/respuestas.js';

const RUTAS = Object.freeze([
  { metodo: 'GET', ruta: '/api/salud', acceso: 'Público', descripcion: 'Estado de la API y de la base de datos' },
  { metodo: 'POST', ruta: '/api/auth/registro', acceso: 'Público', descripcion: 'Registrar un usuario (rol usuario)' },
  { metodo: 'POST', ruta: '/api/auth/login', acceso: 'Público', descripcion: 'Iniciar sesión y obtener un JWT' },
  { metodo: 'GET', ruta: '/api/productos?categoria=', acceso: 'Público', descripcion: 'Listar productos y filtrar por categoría' },
  { metodo: 'GET', ruta: '/api/productos/:id', acceso: 'Público', descripcion: 'Consultar un producto' },
  { metodo: 'POST', ruta: '/api/productos', acceso: 'Administrador', descripcion: 'Crear un producto' },
  { metodo: 'PUT', ruta: '/api/productos/:id', acceso: 'Administrador', descripcion: 'Actualizar un producto' },
  { metodo: 'DELETE', ruta: '/api/productos/:id', acceso: 'Administrador', descripcion: 'Eliminar un producto' },
  { metodo: 'GET', ruta: '/api/favoritos', acceso: 'Autenticado', descripcion: 'Listar sus favoritos' },
  { metodo: 'POST', ruta: '/api/favoritos', acceso: 'Autenticado', descripcion: 'Agregar un producto a sus favoritos' },
  { metodo: 'DELETE', ruta: '/api/favoritos/:productoId', acceso: 'Autenticado', descripcion: 'Quitar un producto de sus favoritos' },
]);

/** GET /api */
export function informacionApi(_req, res) {
  responderOk(res, {
    nombre: 'Catálogo de productos con favoritos y acceso por roles',
    documentacion: 'README.md y docs/API.md del repositorio',
    autenticacion: 'Authorization: Bearer <token> (se obtiene en POST /api/auth/login)',
    rutas: RUTAS,
  });
}
