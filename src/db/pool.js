/**
 * Pool de conexiones a PostgreSQL (node-postgres).
 *
 * Todas las consultas del proyecto pasan por `consultar`, que siempre usa
 * consultas parametrizadas ($1, $2, ...) para evitar inyección SQL.
 */
import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  host: env.db.host,
  port: env.db.puerto,
  database: env.db.nombre,
  user: env.db.usuario,
  password: env.db.contrasena,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Un error en una conexión inactiva no debe derribar el proceso; se registra y el pool la descarta.
pool.on('error', (error) => {
  console.error('[db] Error inesperado en una conexión inactiva:', error.message);
});

/**
 * Ejecuta una consulta parametrizada.
 * @param {string} texto Sentencia SQL con marcadores $1, $2, ...
 * @param {unknown[]} [parametros] Valores que reemplazan a los marcadores.
 */
export function consultar(texto, parametros = []) {
  return pool.query(texto, parametros);
}

/** Comprueba que la base de datos responde. Lanza un error si no hay conexión. */
export async function verificarConexion() {
  await pool.query('SELECT 1');
}

/** Cierra todas las conexiones del pool (cierre ordenado del servidor o de los scripts). */
export function cerrarPool() {
  return pool.end();
}
