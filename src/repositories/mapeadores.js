/**
 * Convierten filas de PostgreSQL (snake_case) en objetos de la API (camelCase).
 * Al construir explícitamente cada objeto se garantiza que columnas sensibles,
 * como contrasena_hash, nunca lleguen a una respuesta.
 */

/** Datos públicos de un usuario (sin hash de contraseña). */
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
    // node-postgres devuelve NUMERIC como texto para no perder precisión; la API expone un número.
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
