
import { z } from 'zod';

z.config(z.locales.es());

export const ENTERO_MAXIMO_PG = 2_147_483_647;

const faltaValor = (valor) => valor === undefined || valor === null;


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


export const idDeRuta = (campo) =>
  z
    .string()
    .regex(/^\d+$/, `El parámetro '${campo}' debe ser un número entero positivo.`)
    .transform(Number)
    .refine(
      (valor) => valor >= 1 && valor <= ENTERO_MAXIMO_PG,
      `El parámetro '${campo}' está fuera del rango permitido.`,
    );
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
