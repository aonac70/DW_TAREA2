
export class AppError extends Error {
 
  constructor(estado, codigo, mensaje, detalles) {
    super(mensaje);
    this.name = 'AppError';
    this.estado = estado;
    this.codigo = codigo;
    this.detalles = detalles;
  }
}

export const solicitudInvalida = (codigo, mensaje, detalles) =>
  new AppError(400, codigo, mensaje, detalles);

export const noAutenticado = (codigo, mensaje) => new AppError(401, codigo, mensaje);

export const accesoDenegado = (mensaje = 'No tiene permisos para realizar esta acción.') =>
  new AppError(403, 'PERMISO_DENEGADO', mensaje);

export const noEncontrado = (codigo, mensaje) => new AppError(404, codigo, mensaje);

export const conflicto = (codigo, mensaje) => new AppError(409, codigo, mensaje);

export const datosInvalidos = (detalles, mensaje = 'Los datos enviados no son válidos.') =>
  new AppError(422, 'VALIDACION_FALLIDA', mensaje, detalles);
