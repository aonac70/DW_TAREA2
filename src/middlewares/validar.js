
import { datosInvalidos, solicitudInvalida } from '../utils/errores.js';

const esObjetoPlano = (valor) =>
  valor !== null && typeof valor === 'object' && !Array.isArray(valor);

const aDetalles = (problemas) =>
  problemas.map((problema) => ({
    campo: problema.path.join('.') || '(cuerpo)',
    mensaje: problema.message,
  }));


export function validar(esquemas) {
  return (req, _res, next) => {
    const validado = {};

    if (esquemas.params) {
      const resultado = esquemas.params.safeParse(req.params);
      if (!resultado.success) {
        throw solicitudInvalida(
          'PARAMETRO_INVALIDO',
          'El parámetro de la ruta no es válido.',
          aDetalles(resultado.error.issues),
        );
      }
      validado.params = resultado.data;
    }

    if (esquemas.query) {
      const resultado = esquemas.query.safeParse(req.query);
      if (!resultado.success) {
        throw solicitudInvalida(
          'FILTRO_INVALIDO',
          'Los filtros de la consulta no son válidos.',
          aDetalles(resultado.error.issues),
        );
      }
      validado.query = resultado.data;
    }

    if (esquemas.body) {
      if (!esObjetoPlano(req.body)) {
        throw solicitudInvalida(
          'CUERPO_INVALIDO',
          'El cuerpo de la petición debe ser un objeto JSON (Content-Type: application/json).',
        );
      }
      const resultado = esquemas.body.safeParse(req.body);
      if (!resultado.success) {
        throw datosInvalidos(aDetalles(resultado.error.issues));
      }
      validado.body = resultado.data;
    }

    req.validado = validado;
    next();
  };
}
