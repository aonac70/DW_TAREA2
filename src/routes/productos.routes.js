import { Router } from 'express';
import * as productosControlador from '../controllers/productos.controller.js';
import { validar } from '../middlewares/validar.js';
import {
  filtroProductosQuery,
  idProductoParams,
  productoSchema,
} from '../validators/productos.schemas.js';

const router = Router();

// Consulta del catálogo.
router.get('/', validar({ query: filtroProductosQuery }), productosControlador.listar);
router.get('/:id', validar({ params: idProductoParams }), productosControlador.obtener);

// Crear, actualizar y eliminar. La protección por rol se agrega junto con la autenticación.
router.post('/', validar({ body: productoSchema }), productosControlador.crear);
router.put(
  '/:id',
  validar({ params: idProductoParams, body: productoSchema }),
  productosControlador.actualizar,
);
router.delete('/:id', validar({ params: idProductoParams }), productosControlador.eliminar);

export default router;
