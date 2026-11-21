/**
 * Respuestas exitosas con un formato JSON consistente:
 *   { "data": ... }                 para un recurso
 *   { "data": [...], "meta": {...} } para listas
 */

/** 200 OK: consultas y actualizaciones exitosas. */
export function responderOk(res, data, meta) {
  return res.status(200).json(meta ? { data, meta } : { data });
}

/** 201 Created: recurso creado. Si se indica, agrega la cabecera Location. */
export function responderCreado(res, data, ubicacion) {
  if (ubicacion) res.location(ubicacion);
  return res.status(201).json({ data });
}

/** 204 No Content: eliminación exitosa (sin cuerpo). */
export function responderSinContenido(res) {
  return res.status(204).end();
}
