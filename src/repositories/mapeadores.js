
export function aUsuario(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    correo: fila.correo,
    rol: fila.rol,
    creadoEn: fila.creado_en,
  };
}

export function aProducto(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    categoria: fila.categoria,
  
    precio: Number(fila.precio),
    creadoEn: fila.creado_en,
    actualizadoEn: fila.actualizado_en,
  };
}

export function aFavorito(fila) {
  return {
    productoId: fila.producto_id,
    agregadoEn: fila.agregado_en,
    producto: aProducto(fila),
  };
}
