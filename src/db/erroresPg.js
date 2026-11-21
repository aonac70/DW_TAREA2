/**
 * Códigos de error de PostgreSQL (SQLSTATE) que la aplicación traduce a respuestas HTTP.
 * Referencia: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const CODIGOS_PG = Object.freeze({
  VIOLACION_UNICA: '23505',
  VIOLACION_LLAVE_FORANEA: '23503',
  BASE_DE_DATOS_INEXISTENTE: '3D000',
});

/**
 * Indica si un error de PostgreSQL corresponde a un código y, opcionalmente, a una restricción concreta.
 * @param {unknown} error Error capturado.
 * @param {string} codigo Código SQLSTATE esperado.
 * @param {string} [restriccion] Nombre de la restricción o índice (definido en db/schema.sql).
 */
export function esErrorPg(error, codigo, restriccion) {
  return error?.code === codigo && (restriccion === undefined || error.constraint === restriccion);
}
