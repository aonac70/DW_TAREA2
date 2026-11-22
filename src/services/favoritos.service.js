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
     
      throw noAutenticado('USUARIO_NO_EXISTE', 'El usuario del token ya no existe.');
    }
    throw error;
  }
}


export async function quitar(usuarioId, productoId) {
  const eliminado = await favoritosRepositorio.eliminar(usuarioId, productoId);
  if (!eliminado) {
    throw noEncontrado('FAVORITO_NO_ENCONTRADO', 'El producto no está en sus favoritos.');
  }
}
