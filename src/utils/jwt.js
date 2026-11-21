/**
 * Emisión y verificación de JSON Web Tokens (HS256).
 *
 * El token solo contiene lo necesario para autorizar: el id del usuario (sub) y su rol.
 * Nunca incluye la contraseña ni su hash.
 */
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const { TokenExpiredError, JsonWebTokenError } = jwt;

/**
 * Firma un token para el usuario.
 * @param {{ id: number, rol: string }} usuario
 * @param {{ expiraEn?: string | number }} [opciones] Vigencia (por defecto JWT_EXPIRES_IN).
 * @returns {{ token: string, expiraEn: string }} Token y fecha de expiración en ISO 8601.
 */
export function firmarToken(usuario, { expiraEn = env.jwt.expiraEn } = {}) {
  const token = jwt.sign({ rol: usuario.rol }, env.jwt.secreto, {
    algorithm: env.jwt.algoritmo,
    subject: String(usuario.id),
    issuer: env.jwt.emisor,
    audience: env.jwt.audiencia,
    expiresIn: expiraEn,
  });
  const { exp } = jwt.decode(token);
  return { token, expiraEn: new Date(exp * 1000).toISOString() };
}

/**
 * Verifica la firma, el algoritmo, el emisor, la audiencia y la expiración del token.
 * @param {string} token
 * @returns {jwt.JwtPayload} Contenido verificado del token.
 * @throws {TokenExpiredError} Si el token venció.
 * @throws {JsonWebTokenError} Si la firma o el formato no son válidos.
 */
export function verificarToken(token) {
  return jwt.verify(token, env.jwt.secreto, {
    algorithms: [env.jwt.algoritmo], // evita ataques de cambio de algoritmo (p. ej. "none")
    issuer: env.jwt.emisor,
    audience: env.jwt.audiencia,
  });
}
