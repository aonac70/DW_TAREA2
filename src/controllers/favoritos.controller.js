/**
 * Controladores de favoritos. La identidad SIEMPRE proviene de req.usuario.id,
 * que el middleware `autenticar` obtuvo del token verificado.
 */
import * as favoritosServicio from '../services/favoritos.service.js';
import { responderCreado, responderOk, responderSinContenido } from '../utils/respuestas.js';

/** GET /api/favoritos */
export async function listar(req, res) {
  const favoritos = await favoritosServicio.listar(req.usuario.id);
  responderOk(res, favoritos, { total: favoritos.length });
}

/** POST /api/favoritos  { "productoId": 1 } */
export async function agregar(req, res) {
  const favorito = await favoritosServicio.agregar(req.usuario.id, req.validado.body.productoId);
  responderCreado(res, favorito);
}

/** DELETE /api/favoritos/:productoId */
export async function quitar(req, res) {
  await favoritosServicio.quitar(req.usuario.id, req.validado.params.productoId);
  responderSinContenido(res);
}
