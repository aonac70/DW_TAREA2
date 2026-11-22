
import { z, idDeRuta, textoObligatorio } from './comunes.js';

const PRECIO_MAXIMO = 99_999_999.99;

const tieneMaximoDosDecimales = (valor) => Math.abs(valor * 100 - Math.round(valor * 100)) < 1e-9;

const precio = z
  .number({
    error: (problema) =>
      problema.input === undefined || problema.input === null
        ? "El campo 'precio' es obligatorio."
        : "El campo 'precio' debe ser un número.",
  })
  .positive("El campo 'precio' debe ser mayor que cero.")
  .max(PRECIO_MAXIMO, `El campo 'precio' no puede superar ${PRECIO_MAXIMO}.`)
  .refine(tieneMaximoDosDecimales, "El campo 'precio' admite como máximo 2 decimales.");

export const productoSchema = z.object({
  nombre: textoObligatorio('nombre', { min: 2, max: 120 }),
  descripcion: textoObligatorio('descripcion', { max: 1000 }),
  categoria: textoObligatorio('categoria', { max: 60 }),
  precio,
});


export const idProductoParams = z.object({
  id: idDeRuta('id'),
});


export const filtroProductosQuery = z.object({
  categoria: z
    .string({ error: "El filtro 'categoria' debe indicarse una sola vez como texto." })
    .trim()
    .min(1, "El filtro 'categoria' no puede estar vacío.")
    .max(60, "El filtro 'categoria' no puede superar 60 caracteres.")
    .optional(),
});
