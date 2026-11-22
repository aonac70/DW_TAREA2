
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { ROLES } from '../config/roles.js';
import { CODIGOS_PG, esErrorPg } from '../db/erroresPg.js';
import * as usuariosRepositorio from '../repositories/usuarios.repository.js';
import { conflicto, noAutenticado } from '../utils/errores.js';
import { firmarToken } from '../utils/jwt.js';


const HASH_FICTICIO = bcrypt.hashSync('contrasena-ficticia-para-tiempo-constante', env.bcrypt.rondas);

export function generarHash(contrasena) {
  return bcrypt.hash(contrasena, env.bcrypt.rondas);
}


export async function registrar({ nombre, correo, contrasena }) {
  const contrasenaHash = await generarHash(contrasena);
  try {
    return await usuariosRepositorio.crear({
      nombre,
      correo,
      contrasenaHash,
      rol: ROLES.USUARIO,
    });
  } catch (error) {
    if (esErrorPg(error, CODIGOS_PG.VIOLACION_UNICA, 'usuarios_correo_unico')) {
      throw conflicto('CORREO_DUPLICADO', 'El correo ya está registrado.');
    }
    throw error;
  }
}


export async function iniciarSesion({ correo, contrasena }) {
  const credenciales = await usuariosRepositorio.buscarCredencialesPorCorreo(correo);
  const contrasenaValida = await bcrypt.compare(
    contrasena,
    credenciales?.contrasenaHash ?? HASH_FICTICIO,
  );

  if (!credenciales || !contrasenaValida) {
    throw noAutenticado('CREDENCIALES_INVALIDAS', 'Correo o contraseña incorrectos.');
  }

  const { token, expiraEn } = firmarToken(credenciales.usuario);
  return { token, tipo: 'Bearer', expiraEn, usuario: credenciales.usuario };
}
