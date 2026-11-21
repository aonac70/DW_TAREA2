/**
 * Genera un JWT firmado con el JWT_SECRET local pero YA VENCIDO (expiró hace 60 s).
 * Sirve para probar en Postman que la API rechaza tokens expirados con 401 TOKEN_EXPIRADO.
 *
 *   npm run token:vencido
 *
 * Copie la salida en el "valor actual" (Current value) de la variable `tokenVencido`
 * del entorno de Postman. No lo guarde en el repositorio.
 * (`npm run test:postman` lo genera e inyecta automáticamente.)
 */
import { ROLES } from '../src/config/roles.js';
import { firmarToken } from '../src/utils/jwt.js';

const { token, expiraEn } = firmarToken({ id: 1, rol: ROLES.USUARIO }, { expiraEn: -60 });

console.error(`Token de prueba vencido el ${expiraEn}. Cópielo en la variable "tokenVencido" de Postman:\n`);
console.log(token);
