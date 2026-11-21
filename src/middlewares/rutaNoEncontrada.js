/** Responde 404 en formato JSON para cualquier ruta que no exista. */
import { noEncontrado } from '../utils/errores.js';

export function rutaNoEncontrada(req, _res, next) {
  next(noEncontrado('RUTA_NO_ENCONTRADA', `La ruta ${req.method} ${req.path} no existe.`));
}
