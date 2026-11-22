import { Router } from 'express';
import { ROLES } from '../config/roles.js';
import * as productosControlador from '../controllers/productos.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { autorizar } from '../middlewares/autorizar.js';
import { validar } from '../middlewares/validar.js';
import {
  filtroProductosQuery,
  idProductoParams,
  productoSchema,
} from '../validators/productos.schemas.js';

const router = Router();


const soloAdministrador = [autenticar, autorizar(ROLES.ADMINISTRADOR)];


router.get('/', validar({ query: filtroProductosQuery }), productosControlador.listar);
router.get('/:id', validar({ params: idProductoParams }), productosControlador.obtener);


router.post('/', soloAdministrador, validar({ body: productoSchema }), productosControlador.crear);
router.put(
  '/:id',
  soloAdministrador,
  validar({ params: idProductoParams, body: productoSchema }),
  productosControlador.actualizar,
);
router.delete(
  '/:id',
  soloAdministrador,
  validar({ params: idProductoParams }),
  productosControlador.eliminar,
);

export default router;
