/** Acceso a datos de la tabla usuarios. Solo SQL parametrizado. */
import { consultar } from '../db/pool.js';
import { aUsuario } from './mapeadores.js';

const COLUMNAS_PUBLICAS = 'id, nombre, correo, rol, creado_en';

/**
 * Inserta un usuario. Lanza el error 23505 de PostgreSQL si el correo ya existe.
 * @returns {Promise<object>} Usuario creado (sin hash).
 */
export async function crear({ nombre, correo, contrasenaHash, rol }) {
  const { rows } = await consultar(
    `INSERT INTO usuarios (nombre, correo, contrasena_hash, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNAS_PUBLICAS}`,
    [nombre, correo, contrasenaHash, rol],
  );
  return aUsuario(rows[0]);
}

/**
 * Busca un usuario por correo e incluye el hash para verificar la contraseña en el login.
 * El hash se devuelve por separado y nunca forma parte del objeto usuario.
 * @returns {Promise<{ usuario: object, contrasenaHash: string } | null>}
 */
export async function buscarCredencialesPorCorreo(correo) {
  const { rows } = await consultar(
    `SELECT ${COLUMNAS_PUBLICAS}, contrasena_hash
       FROM usuarios
      WHERE correo = $1`,
    [correo],
  );
  if (rows.length === 0) return null;
  return { usuario: aUsuario(rows[0]), contrasenaHash: rows[0].contrasena_hash };
}

/**
 * Crea el administrador o, si el correo ya existe, lo actualiza con rol administrador.
 * Solo lo usa el script local scripts/crear-admin.js; no existe ninguna ruta HTTP que lo invoque.
 */
export async function guardarAdministrador({ nombre, correo, contrasenaHash }) {
  const { rows } = await consultar(
    `INSERT INTO usuarios (nombre, correo, contrasena_hash, rol)
     VALUES ($1, $2, $3, 'administrador')
     ON CONFLICT ON CONSTRAINT usuarios_correo_unico
     DO UPDATE SET nombre = EXCLUDED.nombre,
                   contrasena_hash = EXCLUDED.contrasena_hash,
                   rol = 'administrador'
     RETURNING ${COLUMNAS_PUBLICAS}`,
    [nombre, correo, contrasenaHash],
  );
  return aUsuario(rows[0]);
}
