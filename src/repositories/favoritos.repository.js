
import { consultar } from '../db/pool.js';
import { aFavorito } from './mapeadores.js';

const COLUMNAS_PRODUCTO =
  'p.id, p.nombre, p.descripcion, p.categoria, p.precio, p.creado_en, p.actualizado_en';


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


export async function eliminar(usuarioId, productoId) {
  const { rowCount } = await consultar(
    'DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2',
    [usuarioId, productoId],
  );
  return rowCount > 0;
}
