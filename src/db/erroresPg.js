
export const CODIGOS_PG = Object.freeze({
  VIOLACION_UNICA: '23505',
  VIOLACION_LLAVE_FORANEA: '23503',
  BASE_DE_DATOS_INEXISTENTE: '3D000',
});

export function esErrorPg(error, codigo, restriccion) {
  return error?.code === codigo && (restriccion === undefined || error.constraint === restriccion);
}
