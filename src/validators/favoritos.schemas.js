/**
 * Esquemas de validación de favoritos.
 *
 * El cuerpo solo acepta "productoId". Si el cliente envía "usuarioId" se descarta:
 * la identidad del usuario se obtiene exclusivamente del token verificado.
 */
import { z, idDeCuerpo, idDeRuta } from './comunes.js';

export const agregarFavoritoSchema = z.object({
  productoId: idDeCuerpo('productoId'),
});

export const productoIdParams = z.object({
  productoId: idDeRuta('productoId'),
});
