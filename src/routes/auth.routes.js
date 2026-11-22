import { Router } from 'express';
import * as authControlador from '../controllers/auth.controller.js';
import { validar } from '../middlewares/validar.js';
import { loginSchema, registroSchema } from '../validators/auth.schemas.js';

const router = Router();


router.post('/registro', validar({ body: registroSchema }), authControlador.registrar);


router.post('/login', validar({ body: loginSchema }), authControlador.iniciarSesion);

export default router;
