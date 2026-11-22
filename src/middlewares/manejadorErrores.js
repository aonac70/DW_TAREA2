
import { AppError } from '../utils/errores.js';


const ERRORES_CUERPO = {
  'entity.parse.failed': {
    estado: 400,
    codigo: 'JSON_INVALIDO',
    mensaje: 'El cuerpo de la petición no es un JSON válido.',
  },
  'entity.too.large': {
    estado: 413,
    codigo: 'CUERPO_DEMASIADO_GRANDE',
    mensaje: 'El cuerpo de la petición supera el tamaño permitido.',
  },
  'charset.unsupported': {
    estado: 415,
    codigo: 'CODIFICACION_NO_SOPORTADA',
    mensaje: 'La codificación del cuerpo no es compatible. Use UTF-8.',
  },
  'encoding.unsupported': {
    estado: 415,
    codigo: 'CODIFICACION_NO_SOPORTADA',
    mensaje: 'La codificación del cuerpo no es compatible.',
  },
};

const ERROR_INTERNO = {
  estado: 500,
  codigo: 'ERROR_INTERNO',
  mensaje: 'Ocurrió un error interno. Intente nuevamente más tarde.',
};

function normalizar(error) {
  if (error instanceof AppError) {
    return {
      estado: error.estado,
      codigo: error.codigo,
      mensaje: error.message,
      detalles: error.detalles,
    };
  }
  return ERRORES_CUERPO[error?.type] ?? ERROR_INTERNO;
}


export function manejadorErrores(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const { estado, codigo, mensaje, detalles } = normalizar(error);

  if (estado >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, error);
  }

  if (estado === 401) {
  
    res.set('WWW-Authenticate', 'Bearer realm="catalogo-api"');
  }

  return res.status(estado).json({
    error: { estado, codigo, mensaje, ...(detalles?.length ? { detalles } : {}) },
  });
}
