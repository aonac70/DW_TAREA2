import { Router } from 'express';
import * as favoritosControlador from '../controllers/favoritos.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { validar } from '../middlewares/validar.js';
import { agregarFavoritoSchema, productoIdParams } from '../validators/favoritos.schemas.js';

const router = Router();

// Todas las rutas de favoritos requieren un usuario autenticado (cualquier rol).
router.use(autenticar);

router.get('/', favoritosControlador.listar);
router.post('/', validar({ body: agregarFavoritoSchema }), favoritosControlador.agregar);
router.delete('/:productoId', validar({ params: productoIdParams }), favoritosControlador.quitar);

export default router;
