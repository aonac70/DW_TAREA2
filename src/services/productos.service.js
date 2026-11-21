/**
 * Reglas de negocio del catálogo de productos.
 */
import { CODIGOS_PG, esErrorPg } from '../db/erroresPg.js';
import * as productosRepositorio from '../repositories/productos.repository.js';
import { conflicto, noEncontrado } from '../utils/errores.js';

const productoNoEncontrado = () =>
  noEncontrado('PRODUCTO_NO_ENCONTRADO', 'El producto solicitado no existe.');

/** Traduce las violaciones de restricciones de la base de datos a errores HTTP. */
function traducirErrorDeEscritura(error) {
  if (esErrorPg(error, CODIGOS_PG.VIOLACION_UNICA, 'productos_nombre_unico')) {
    return conflicto('PRODUCTO_DUPLICADO', 'Ya existe un producto con ese nombre.');
  }
  return error;
}

export function listar(filtros) {
  return productosRepositorio.listar(filtros);
}

export async function obtenerPorId(id) {
  const producto = await productosRepositorio.buscarPorId(id);
  if (!producto) throw productoNoEncontrado();
  return producto;
}

export async function crear(datos) {
  try {
    return await productosRepositorio.crear(datos);
  } catch (error) {
    throw traducirErrorDeEscritura(error);
  }
}

export async function actualizar(id, datos) {
  let producto;
  try {
    producto = await productosRepositorio.actualizar(id, datos);
  } catch (error) {
    throw traducirErrorDeEscritura(error);
  }
  if (!producto) throw productoNoEncontrado();
  return producto;
}

/**
 * Elimina el producto. Decisión de diseño: sus favoritos se eliminan en cascada
 * (ON DELETE CASCADE en db/schema.sql), así no quedan favoritos huérfanos.
 */
export async function eliminar(id) {
  const eliminado = await productosRepositorio.eliminar(id);
  if (!eliminado) throw productoNoEncontrado();
}
