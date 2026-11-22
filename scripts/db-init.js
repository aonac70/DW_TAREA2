
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { env } from '../src/config/env.js';
import { CODIGOS_PG, esErrorPg } from '../src/db/erroresPg.js';

const reiniciar = process.argv.includes('--reset');

const configuracion = (baseDeDatos) => ({
  host: env.db.host,
  port: env.db.puerto,
  user: env.db.usuario,
  password: env.db.contrasena,
  database: baseDeDatos,
});

const leerSql = (archivo) => readFile(new URL(`../db/${archivo}`, import.meta.url), 'utf8');

async function crearBaseDeDatos() {
  console.log(`[db] La base de datos "${env.db.nombre}" no existe. Creándola...`);
  const cliente = new pg.Client(configuracion('postgres'));
  await cliente.connect();
  try {
    await cliente.query(`CREATE DATABASE ${cliente.escapeIdentifier(env.db.nombre)}`);
  } finally {
    await cliente.end();
  }
}

async function conectar() {
  const cliente = new pg.Client(configuracion(env.db.nombre));
  try {
    await cliente.connect();
    return cliente;
  } catch (error) {
    if (!esErrorPg(error, CODIGOS_PG.BASE_DE_DATOS_INEXISTENTE)) throw error;
  }
  await crearBaseDeDatos();
  const nuevoCliente = new pg.Client(configuracion(env.db.nombre));
  await nuevoCliente.connect();
  return nuevoCliente;
}

async function main() {
  if (reiniciar && env.esProduccion) {
    throw new Error('db:reset está deshabilitado cuando NODE_ENV=production.');
  }

  const cliente = await conectar();
  try {
    await cliente.query('BEGIN');
    if (reiniciar) {
      await cliente.query(await leerSql('reset.sql'));
      console.log('[db] --reset: tablas eliminadas.');
    }
    await cliente.query(await leerSql('schema.sql'));
    const semilla = await cliente.query(await leerSql('seed.sql'));
    await cliente.query('COMMIT');

    const { rows } = await cliente.query('SELECT count(*)::int AS total FROM productos');
    console.log(`[db] Esquema aplicado en "${env.db.nombre}".`);
    console.log(
      `[db] Productos de ejemplo insertados: ${semilla.rowCount}. Total en el catálogo: ${rows[0].total}.`,
    );
  } catch (error) {
    await cliente.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await cliente.end();
  }
}

main().catch((error) => {
  console.error('[db] No se pudo inicializar la base de datos:', error.message);
  process.exitCode = 1;
});
