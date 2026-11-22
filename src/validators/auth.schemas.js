
import { z, correo, textoObligatorio } from './comunes.js';

const BYTES_MAXIMOS_BCRYPT = 72;

const contrasenaNueva = z
  .string({
    error: (problema) =>
      problema.input === undefined || problema.input === null
        ? "El campo 'contrasena' es obligatorio."
        : "El campo 'contrasena' debe ser un texto.",
  })
  .min(8, "El campo 'contrasena' debe tener al menos 8 caracteres.")
  .refine(
    (valor) => Buffer.byteLength(valor, 'utf8') <= BYTES_MAXIMOS_BCRYPT,
    `El campo 'contrasena' no puede superar ${BYTES_MAXIMOS_BCRYPT} bytes.`,
  )
  .refine(
    (valor) => /\p{L}/u.test(valor) && /\d/.test(valor),
    "El campo 'contrasena' debe incluir al menos una letra y un número.",
  );

export const registroSchema = z.object({
  nombre: textoObligatorio('nombre', { min: 2, max: 100 }),
  correo,
  contrasena: contrasenaNueva,
});

export const loginSchema = z.object({
  correo,
  contrasena: z
    .string({
      error: (problema) =>
        problema.input === undefined || problema.input === null
          ? "El campo 'contrasena' es obligatorio."
          : "El campo 'contrasena' debe ser un texto.",
    })
    .min(1, "El campo 'contrasena' no puede estar vacío.")
    .max(200, "El campo 'contrasena' no puede superar 200 caracteres."),
});
