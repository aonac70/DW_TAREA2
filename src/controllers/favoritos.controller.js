
import * as favoritosServicio from '../services/favoritos.service.js';
import { responderCreado, responderOk, responderSinContenido } from '../utils/respuestas.js';


export async function listar(req, res) {
  const favoritos = await favoritosServicio.listar(req.usuario.id);
  responderOk(res, favoritos, { total: favoritos.length });
}


export async function agregar(req, res) {
  const favorito = await favoritosServicio.agregar(req.usuario.id, req.validado.body.productoId);
  responderCreado(res, favorito);
}


export async function quitar(req, res) {
  await favoritosServicio.quitar(req.usuario.id, req.validado.params.productoId);
  responderSinContenido(res);
}
