/** Enrutador principal montado en /api. */
import { Router } from 'express';
import { consultarSalud } from '../controllers/salud.controller.js';
import authRutas from './auth.routes.js';
import favoritosRutas from './favoritos.routes.js';
import productosRutas from './productos.routes.js';

const router = Router();

router.get('/salud', consultarSalud);
router.use('/auth', authRutas);
router.use('/productos', productosRutas);
router.use('/favoritos', favoritosRutas);

export default router;
