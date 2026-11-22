
import * as productosServicio from '../services/productos.service.js';
import { responderCreado, responderOk, responderSinContenido } from '../utils/respuestas.js';


export async function listar(req, res) {
  const { categoria } = req.validado.query;
  const productos = await productosServicio.listar({ categoria });
  responderOk(res, productos, { total: productos.length, categoria: categoria ?? null });
}


export async function obtener(req, res) {
  const producto = await productosServicio.obtenerPorId(req.validado.params.id);
  responderOk(res, producto);
}


export async function crear(req, res) {
  const producto = await productosServicio.crear(req.validado.body);
  responderCreado(res, producto, `${req.baseUrl}/${producto.id}`);
}


export async function actualizar(req, res) {
  const producto = await productosServicio.actualizar(req.validado.params.id, req.validado.body);
  responderOk(res, producto);
}


export async function eliminar(req, res) {
  await productosServicio.eliminar(req.validado.params.id);
  responderSinContenido(res);
}
