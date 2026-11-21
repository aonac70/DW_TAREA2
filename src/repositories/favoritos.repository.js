/**
 * Acceso a datos de la tabla favoritos. Solo SQL parametrizado.
 * Todas las operaciones filtran por usuario_id: un usuario nunca puede leer
 * ni modificar favoritos ajenos.
 */
import { consultar } from '../db/pool.js';
import { aFavorito } from './mapeadores.js';

const COLUMNAS_PRODUCTO =
  'p.id, p.nombre, p.descripcion, p.categoria, p.precio, p.creado_en, p.actualizado_en';

/** Favoritos del usuario, del más reciente al más antiguo, con los datos del producto. */
export async function listarPorUsuario(usuarioId) {
  const { rows } = await consultar(
    `SELECT f.producto_id, f.creado_en AS agregado_en, ${COLUMNAS_PRODUCTO}
       FROM favoritos f
       JOIN productos p ON p.id = f.producto_id
      WHERE f.usuario_id = $1
      ORDER BY f.creado_en DESC, f.producto_id`,
    [usuarioId],
  );
  return rows.map(aFavorito);
}

/**
 * Agrega un producto a los favoritos del usuario en una sola sentencia atómica.
 * La base de datos garantiza la integridad:
 *  - 23505 (favoritos_pk): el favorito ya existe.
 *  - 23503 (favoritos_producto_fk): el producto no existe.
 */
export async function agregar(usuarioId, productoId) {
  const { rows } = await consultar(
    `WITH nuevo AS (
       INSERT INTO favoritos (usuario_id, producto_id)
       VALUES ($1, $2)
       RETURNING producto_id, creado_en
     )
     SELECT nuevo.producto_id, nuevo.creado_en AS agregado_en, ${COLUMNAS_PRODUCTO}
       FROM nuevo
       JOIN productos p ON p.id = nuevo.producto_id`,
    [usuarioId, productoId],
  );
  return aFavorito(rows[0]);
}

/** @returns {Promise<boolean>} true si el favorito pertenecía al usuario y se eliminó. */
export async function eliminar(usuarioId, productoId) {
  const { rowCount } = await consultar(
    'DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2',
    [usuarioId, productoId],
  );
  return rowCount > 0;
}
