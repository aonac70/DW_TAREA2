
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const { TokenExpiredError, JsonWebTokenError } = jwt;


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


export function verificarToken(token) {
  return jwt.verify(token, env.jwt.secreto, {
    algorithms: [env.jwt.algoritmo], 
    issuer: env.jwt.emisor,
    audience: env.jwt.audiencia,
  });
}
