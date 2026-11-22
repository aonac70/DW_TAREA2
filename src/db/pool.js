
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

pool.on('error', (error) => {
  console.error('[db] Error inesperado en una conexión inactiva:', error.message);
});

export function consultar(texto, parametros = []) {
  return pool.query(texto, parametros);
}

export async function verificarConexion() {
  await pool.query('SELECT 1');
}

export function cerrarPool() {
  return pool.end();
}
