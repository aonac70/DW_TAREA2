/**
 * Piezas de validación reutilizables (Zod).
 * Los mensajes se escriben en español y nombran el campo afectado.
 */
import { z } from 'zod';

z.config(z.locales.es());

/** Máximo valor de una columna INTEGER de PostgreSQL. */
export const ENTERO_MAXIMO_PG = 2_147_483_647;

const faltaValor = (valor) => valor === undefined || valor === null;

/**
 * Texto obligatorio: se recortan espacios y no puede quedar vacío.
 * @param {string} campo Nombre del campo en el JSON.
 * @param {{ min?: number, max: number }} limites
 */
export const textoObligatorio = (campo, { min = 1, max }) =>
  z
    .string({
      error: (problema) =>
        faltaValor(problema.input)
          ? `El campo '${campo}' es obligatorio.`
          : `El campo '${campo}' debe ser un texto.`,
    })
    .trim()
    .min(
      min,
      min === 1
        ? `El campo '${campo}' no puede estar vacío.`
        : `El campo '${campo}' debe tener al menos ${min} caracteres.`,
    )
    .max(max, `El campo '${campo}' no puede superar ${max} caracteres.`);

/** Correo electrónico normalizado (sin espacios y en minúsculas). */
export const correo = z
  .string({
    error: (problema) =>
      faltaValor(problema.input)
        ? "El campo 'correo' es obligatorio."
        : "El campo 'correo' debe ser un texto.",
  })
  .trim()
  .toLowerCase()
  .min(1, "El campo 'correo' no puede estar vacío.")
  .max(254, "El campo 'correo' no puede superar 254 caracteres.")
  .pipe(z.email("El campo 'correo' no tiene un formato válido."));

/**
 * Identificador numérico recibido en la URL (siempre llega como texto).
 * Solo acepta dígitos para rechazar valores como "1.5", "1e3", "0x10" o "-1".
 */
export const idDeRuta = (campo) =>
  z
    .string()
    .regex(/^\d+$/, `El parámetro '${campo}' debe ser un número entero positivo.`)
    .transform(Number)
    .refine(
      (valor) => valor >= 1 && valor <= ENTERO_MAXIMO_PG,
      `El parámetro '${campo}' está fuera del rango permitido.`,
    );

/** Identificador numérico recibido en el cuerpo JSON. */
export const idDeCuerpo = (campo) =>
  z
    .number({
      error: (problema) =>
        faltaValor(problema.input)
          ? `El campo '${campo}' es obligatorio.`
          : `El campo '${campo}' debe ser un número entero positivo.`,
    })
    .int(`El campo '${campo}' debe ser un número entero positivo.`)
    .positive(`El campo '${campo}' debe ser un número entero positivo.`)
    .max(ENTERO_MAXIMO_PG, `El campo '${campo}' está fuera del rango permitido.`);

export { z };
