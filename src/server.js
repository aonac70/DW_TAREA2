import http from 'node:http';
import { crearApp } from './app.js';
import { env } from './config/env.js';
import { cerrarPool, verificarConexion } from './db/pool.js';

async function iniciar() {
  try {
    await verificarConexion();
  } catch (error) {
    console.error(
      `[db] No se pudo conectar a PostgreSQL en ${env.db.host}:${env.db.puerto}/${env.db.nombre}.`,
      `Motivo: ${error.message}`,
    );
    console.error('[db] Verifique que PostgreSQL esté en ejecución y los valores DB_* de .env.');
    process.exit(1);
  }

  const servidor = http.createServer(crearApp());

  servidor.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`[api] El puerto ${env.puerto} ya está en uso. Cambie PORT en .env.`);
    } else {
      console.error('[api] Error del servidor:', error.message);
    }
    process.exit(1);
  });

  servidor.listen(env.puerto, () => {
    console.log(`[api] Servidor escuchando en http://localhost:${env.puerto}/api (${env.nodeEnv})`);
  });

  const cerrar = (senal) => {
    console.log(`[api] ${senal} recibido. Cerrando el servidor...`);
    // Si el cierre se demora, se fuerza la salida.
    setTimeout(() => process.exit(1), 10_000).unref();
    servidor.close(async () => {
      await cerrarPool();
      console.log('[api] Servidor detenido.');
      process.exit(0);
    });
  };

  process.once('SIGINT', () => cerrar('SIGINT'));
  process.once('SIGTERM', () => cerrar('SIGTERM'));
}

iniciar();
