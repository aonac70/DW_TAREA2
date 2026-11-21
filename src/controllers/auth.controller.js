/**
 * Controladores de autenticación: traducen HTTP ⇄ servicio.
 * Express 5 propaga automáticamente al manejador de errores las promesas rechazadas.
 */
import * as authServicio from '../services/auth.service.js';
import { responderCreado, responderOk } from '../utils/respuestas.js';

/** POST /api/auth/registro */
export async function registrar(req, res) {
  const usuario = await authServicio.registrar(req.validado.body);
  responderCreado(res, usuario);
}

/** POST /api/auth/login */
export async function iniciarSesion(req, res) {
  const sesion = await authServicio.iniciarSesion(req.validado.body);
  responderOk(res, sesion);
}
