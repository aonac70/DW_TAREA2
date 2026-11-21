/** Acceso a datos de la tabla productos. Solo SQL parametrizado. */
import { consultar } from '../db/pool.js';
import { aProducto } from './mapeadores.js';

const COLUMNAS = 'id, nombre, descripcion, categoria, precio, creado_en, actualizado_en';

/**
 * Lista productos ordenados por id. Si se indica categoría, filtra sin distinguir mayúsculas.
 * @param {{ categoria?: string }} [filtros]
 */
export async function listar({ categoria } = {}) {
  const { rows } = await consultar(
    `SELECT ${COLUMNAS}
       FROM productos
      WHERE ($1::text IS NULL OR lower(categoria) = lower($1::text))
      ORDER BY id`,
    [categoria ?? null],
  );
  return rows.map(aProducto);
}

/** @returns {Promise<object | null>} */
export async function buscarPorId(id) {
  const { rows } = await consultar(`SELECT ${COLUMNAS} FROM productos WHERE id = $1`, [id]);
  return rows.length ? aProducto(rows[0]) : null;
}

export async function crear({ nombre, descripcion, categoria, precio }) {
  const { rows } = await consultar(
    `INSERT INTO productos (nombre, descripcion, categoria, precio)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNAS}`,
    [nombre, descripcion, categoria, precio],
  );
  return aProducto(rows[0]);
}

/** @returns {Promise<object | null>} null si el producto no existe. */
export async function actualizar(id, { nombre, descripcion, categoria, precio }) {
  const { rows } = await consultar(
    `UPDATE productos
        SET nombre = $2,
            descripcion = $3,
            categoria = $4,
            precio = $5,
            actualizado_en = now()
      WHERE id = $1
      RETURNING ${COLUMNAS}`,
    [id, nombre, descripcion, categoria, precio],
  );
  return rows.length ? aProducto(rows[0]) : null;
}

/**
 * Elimina un producto. Sus favoritos se eliminan automáticamente (ON DELETE CASCADE).
 * @returns {Promise<boolean>} true si existía y se eliminó.
 */
export async function eliminar(id) {
  const { rowCount } = await consultar('DELETE FROM productos WHERE id = $1', [id]);
  return rowCount > 0;
}
