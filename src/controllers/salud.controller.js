/**
 * Estado del servicio. `iniciadoEn` cambia cada vez que se reinicia Node.js, lo que permite
 * evidenciar en las pruebas que los datos persisten tras un reinicio real del servidor.
 */
import { verificarConexion } from '../db/pool.js';
import { AppError } from '../utils/errores.js';
import { responderOk } from '../utils/respuestas.js';

const INICIADO_EN = new Date().toISOString();

/** GET /api/salud */
export async function consultarSalud(_req, res) {
  try {
    await verificarConexion();
  } catch {
    throw new AppError(503, 'BASE_DATOS_NO_DISPONIBLE', 'La base de datos no está disponible.');
  }
  responderOk(res, { estado: 'ok', baseDatos: 'conectada', iniciadoEn: INICIADO_EN });
}
