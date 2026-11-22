
import { LISTA_ROLES } from '../config/roles.js';
import { noAutenticado } from '../utils/errores.js';
import { TokenExpiredError, verificarToken } from '../utils/jwt.js';

const tokenInvalido = () => noAutenticado('TOKEN_INVALIDO', 'El token de acceso no es válido.');

export function autenticar(req, _res, next) {
  const cabecera = req.get('Authorization');

  if (!cabecera) {
    throw noAutenticado(
      'TOKEN_REQUERIDO',
      'Se requiere un token de acceso. Envíe la cabecera Authorization: Bearer <token>.',
    );
  }

  const [esquema, token, ...sobrante] = cabecera.trim().split(/\s+/);
  if (esquema !== 'Bearer' || !token || sobrante.length > 0) {
    throw noAutenticado(
      'TOKEN_MAL_FORMADO',
      'La cabecera Authorization debe tener el formato: Bearer <token>.',
    );
  }

  let contenido;
  try {
    contenido = verificarToken(token);
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw noAutenticado('TOKEN_EXPIRADO', 'El token de acceso ha expirado. Inicie sesión nuevamente.');
    }
    throw tokenInvalido();
  }


  const id = Number(contenido.sub);
  if (!Number.isSafeInteger(id) || id <= 0 || !LISTA_ROLES.includes(contenido.rol)) {
    throw tokenInvalido();
  }

  req.usuario = Object.freeze({ id, rol: contenido.rol });
  next();
}
