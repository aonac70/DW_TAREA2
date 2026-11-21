import { Router } from 'express';
import * as authControlador from '../controllers/auth.controller.js';
import { validar } from '../middlewares/validar.js';
import { loginSchema, registroSchema } from '../validators/auth.schemas.js';

const router = Router();

// Público: registra SIEMPRE con rol "usuario".
router.post('/registro', validar({ body: registroSchema }), authControlador.registrar);

// Público: valida credenciales y emite un JWT con vencimiento.
router.post('/login', validar({ body: loginSchema }), authControlador.iniciarSesion);

export default router;
