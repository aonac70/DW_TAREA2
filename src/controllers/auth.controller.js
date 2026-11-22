
import * as authServicio from '../services/auth.service.js';
import { responderCreado, responderOk } from '../utils/respuestas.js';


export async function registrar(req, res) {
  const usuario = await authServicio.registrar(req.validado.body);
  responderCreado(res, usuario);
}


export async function iniciarSesion(req, res) {
  const sesion = await authServicio.iniciarSesion(req.validado.body);
  responderOk(res, sesion);
}
