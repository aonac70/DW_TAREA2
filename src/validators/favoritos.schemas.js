
import { z, idDeCuerpo, idDeRuta } from './comunes.js';

export const agregarFavoritoSchema = z.object({
  productoId: idDeCuerpo('productoId'),
});

export const productoIdParams = z.object({
  productoId: idDeRuta('productoId'),
});
