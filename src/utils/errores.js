/**
 * Errores de aplicación con estado HTTP, código estable y mensaje para el cliente.
 * El middleware manejadorErrores los convierte en la respuesta JSON estándar:
 *   { "error": { "estado", "codigo", "mensaje", "detalles"? } }
 */
export class AppError extends Error {
  /**
   * @param {number} estado Código de estado HTTP.
   * @param {string} codigo Identificador estable del error (p. ej. PRODUCTO_NO_ENCONTRADO).
   * @param {string} mensaje Mensaje legible para el cliente (sin detalles internos).
   * @param {Array<{campo: string, mensaje: string}>} [detalles] Errores por campo.
   */
  constructor(estado, codigo, mensaje, detalles) {
    super(mensaje);
    this.name = 'AppError';
    this.estado = estado;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

/** 400: la petición está mal formada (JSON inválido, parámetro de ruta o filtro inválido). */
export const solicitudInvalida = (codigo, mensaje, detalles) =>
  new AppError(400, codigo, mensaje, detalles);

/** 401: falta autenticación o el token/credenciales no son válidos. */
export const noAutenticado = (codigo, mensaje) => new AppError(401, codigo, mensaje);

/** 403: autenticado, pero sin permisos para la operación. */
export const accesoDenegado = (mensaje = 'No tiene permisos para realizar esta acción.') =>
  new AppError(403, 'PERMISO_DENEGADO', mensaje);

/** 404: el recurso solicitado no existe. */
export const noEncontrado = (codigo, mensaje) => new AppError(404, codigo, mensaje);

/** 409: el recurso entra en conflicto con uno existente (duplicado). */
export const conflicto = (codigo, mensaje) => new AppError(409, codigo, mensaje);

/** 422: el JSON es válido, pero su contenido no cumple las reglas de validación. */
export const datosInvalidos = (detalles, mensaje = 'Los datos enviados no son válidos.') =>
  new AppError(422, 'VALIDACION_FALLIDA', mensaje, detalles);
