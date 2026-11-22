
export function responderOk(res, data, meta) {
  return res.status(200).json(meta ? { data, meta } : { data });
}

export function responderCreado(res, data, ubicacion) {
  if (ubicacion) res.location(ubicacion);
  return res.status(201).json({ data });
}

export function responderSinContenido(res) {
  return res.status(204).end();
}
