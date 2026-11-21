/**
 * Manejador central de errores. Toda respuesta de error tiene la forma:
 *   { "error": { "estado": 404, "codigo": "PRODUCTO_NO_ENCONTRADO", "mensaje": "...", "detalles"?: [...] } }
 *
 * Nunca se envían al cliente trazas (stack), sentencias SQL, secretos ni mensajes internos:
 * los errores inesperados responden 500 con un mensaje genérico y se registran solo en el servidor.
 */
import { AppError } from '../utils/errores.js';

/** Errores generados por express.json() (body-parser) antes de llegar a las rutas. */
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

// Express reconoce un manejador de errores porque recibe 4 argumentos.
export function manejadorErrores(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const { estado, codigo, mensaje, detalles } = normalizar(error);

  if (estado >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, error);
  }

  if (estado === 401) {
    // RFC 6750: indica al cliente el esquema de autenticación esperado.
    res.set('WWW-Authenticate', 'Bearer realm="catalogo-api"');
  }

  return res.status(estado).json({
    error: { estado, codigo, mensaje, ...(detalles?.length ? { detalles } : {}) },
  });
}
