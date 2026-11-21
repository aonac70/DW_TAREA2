/**
 * Middleware de autenticación.
 *
 * 1. Exige la cabecera "Authorization: Bearer <token>".
 * 2. Verifica firma, algoritmo, emisor, audiencia y expiración del JWT.
 * 3. Deja la identidad verificada en req.usuario = { id, rol }.
 *
 * Las rutas protegidas usan SIEMPRE req.usuario.id; nunca un id enviado por el cliente.
 */
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

  // Defensa adicional: el contenido firmado debe tener la forma esperada.
  const id = Number(contenido.sub);
  if (!Number.isSafeInteger(id) || id <= 0 || !LISTA_ROLES.includes(contenido.rol)) {
    throw tokenInvalido();
  }

  req.usuario = Object.freeze({ id, rol: contenido.rol });
  next();
}
