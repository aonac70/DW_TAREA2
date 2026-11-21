/**
 * Reglas de negocio de favoritos. Todas las funciones reciben el id del usuario
 * obtenido del token verificado (req.usuario.id), nunca uno enviado por el cliente.
 */
import { CODIGOS_PG, esErrorPg } from '../db/erroresPg.js';
import * as favoritosRepositorio from '../repositories/favoritos.repository.js';
import { conflicto, noAutenticado, noEncontrado } from '../utils/errores.js';

export function listar(usuarioId) {
  return favoritosRepositorio.listarPorUsuario(usuarioId);
}

export async function agregar(usuarioId, productoId) {
  try {
    return await favoritosRepositorio.agregar(usuarioId, productoId);
  } catch (error) {
    if (esErrorPg(error, CODIGOS_PG.VIOLACION_UNICA, 'favoritos_pk')) {
      throw conflicto('FAVORITO_DUPLICADO', 'El producto ya está en sus favoritos.');
    }
    if (esErrorPg(error, CODIGOS_PG.VIOLACION_LLAVE_FORANEA, 'favoritos_producto_fk')) {
      throw noEncontrado('PRODUCTO_NO_ENCONTRADO', 'El producto solicitado no existe.');
    }
    if (esErrorPg(error, CODIGOS_PG.VIOLACION_LLAVE_FORANEA, 'favoritos_usuario_fk')) {
      // El token es válido, pero el usuario fue eliminado después de emitirlo.
      throw noAutenticado('USUARIO_NO_EXISTE', 'El usuario del token ya no existe.');
    }
    throw error;
  }
}

/**
 * Quita un favorito del usuario. Si el producto no está en SUS favoritos (aunque sí esté
 * en los de otro usuario) responde 404: no revela ni modifica datos ajenos.
 */
export async function quitar(usuarioId, productoId) {
  const eliminado = await favoritosRepositorio.eliminar(usuarioId, productoId);
  if (!eliminado) {
    throw noEncontrado('FAVORITO_NO_ENCONTRADO', 'El producto no está en sus favoritos.');
  }
}
