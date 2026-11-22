
import { ROLES } from '../src/config/roles.js';
import { firmarToken } from '../src/utils/jwt.js';

const { token, expiraEn } = firmarToken({ id: 1, rol: ROLES.USUARIO }, { expiraEn: -60 });

console.error(`Token de prueba vencido el ${expiraEn}. Cópielo en la variable "tokenVencido" de Postman:\n`);
console.log(token);
