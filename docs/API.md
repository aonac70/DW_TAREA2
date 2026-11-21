# Referencia de la API

- **URL base:** `http://localhost:3000/api`
- **Formato:** JSON (`Content-Type: application/json`) en peticiones y respuestas.
- **Autenticación:** cabecera `Authorization: Bearer <token>` en las rutas marcadas como *Autenticado* o *Administrador*.

## Convenciones

### Respuestas exitosas

```json
{ "data": { } }
```

En las listas se añade `meta`:

```json
{ "data": [ ], "meta": { "total": 3 } }
```

### Respuestas de error

```json
{
  "error": {
    "estado": 422,
    "codigo": "VALIDACION_FALLIDA",
    "mensaje": "Los datos enviados no son válidos.",
    "detalles": [
      { "campo": "precio", "mensaje": "El campo 'precio' debe ser mayor que cero." }
    ]
  }
}
```

`detalles` solo aparece cuando hay errores por campo. Las respuestas `401` incluyen la cabecera `WWW-Authenticate: Bearer realm="catalogo-api"`.

### Errores comunes a todas las rutas

| Estado | Código | Cuándo |
|---|---|---|
| 400 | `JSON_INVALIDO` | El cuerpo tiene errores de sintaxis JSON. |
| 400 | `CUERPO_INVALIDO` | El cuerpo no es un objeto JSON o falta `Content-Type: application/json`. |
| 404 | `RUTA_NO_ENCONTRADA` | La ruta o el método no existen. |
| 413 | `CUERPO_DEMASIADO_GRANDE` | El cuerpo supera 10 kB. |
| 500 | `ERROR_INTERNO` | Error inesperado; el detalle solo se registra en el servidor. |

### Errores de autenticación y autorización

| Estado | Código | Cuándo |
|---|---|---|
| 401 | `TOKEN_REQUERIDO` | No se envió la cabecera `Authorization`. |
| 401 | `TOKEN_MAL_FORMADO` | La cabecera no tiene el formato `Bearer <token>`. |
| 401 | `TOKEN_EXPIRADO` | El token venció (se verifica `exp`). |
| 401 | `TOKEN_INVALIDO` | Firma, algoritmo, emisor o audiencia inválidos, o el token fue alterado. |
| 403 | `PERMISO_DENEGADO` | El token es válido, pero el rol no tiene permiso (solo para el administrador). |

### Criterio 400 vs 422

- **400:** la petición está mal formada (JSON roto, cuerpo que no es objeto, `:id` no numérico, filtro vacío).
- **422:** el JSON es correcto, pero su contenido incumple las reglas (campos obligatorios, vacíos, formato de correo, precio, etc.).

---

## Salud

### `GET /salud`: público

Comprueba que la API y la base de datos responden. `iniciadoEn` es la hora en que arrancó el proceso de Node.js y cambia en cada reinicio.

**200 OK**

```json
{ "data": { "estado": "ok", "baseDatos": "conectada", "iniciadoEn": "2026-11-21T03:59:14.689Z" } }
```

**503** `BASE_DATOS_NO_DISPONIBLE`: la base de datos no responde.

---

## Autenticación

### `POST /auth/registro`: público

Registra un usuario. **El rol siempre es `usuario`**: cualquier campo adicional, como `rol`, se descarta.

**Cuerpo**

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | string | Obligatorio, de 2 a 100 caracteres (se recortan los espacios). |
| `correo` | string | Obligatorio, formato de correo válido; se guarda en minúsculas; único. |
| `contrasena` | string | Obligatorio, 8 caracteres o más (máximo 72 bytes), con al menos una letra y un número. |

```json
{ "nombre": "Ana Prueba", "correo": "ana@correo.test", "contrasena": "Clave12345" }
```

**201 Created**

```json
{
  "data": {
    "id": 2,
    "nombre": "Ana Prueba",
    "correo": "ana@correo.test",
    "rol": "usuario",
    "creadoEn": "2026-11-21T03:59:16.517Z"
  }
}
```

**Errores**

| Estado | Código | Cuándo |
|---|---|---|
| 409 | `CORREO_DUPLICADO` | El correo ya está registrado (sin distinguir mayúsculas). |
| 422 | `VALIDACION_FALLIDA` | Algún campo no cumple las reglas. |

```json
{
  "error": {
    "estado": 422,
    "codigo": "VALIDACION_FALLIDA",
    "mensaje": "Los datos enviados no son válidos.",
    "detalles": [
      { "campo": "nombre", "mensaje": "El campo 'nombre' debe tener al menos 2 caracteres." },
      { "campo": "correo", "mensaje": "El campo 'correo' no tiene un formato válido." },
      { "campo": "contrasena", "mensaje": "El campo 'contrasena' debe tener al menos 8 caracteres." }
    ]
  }
}
```

### `POST /auth/login`: público

Valida las credenciales y emite un JWT firmado (HS256) con vencimiento (`JWT_EXPIRES_IN`, por defecto 1 hora).

**Cuerpo**

```json
{ "correo": "ana@correo.test", "contrasena": "Clave12345" }
```

**200 OK**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2wiOiJ1c3VhcmlvIiwiaWF0Ijo…",
    "tipo": "Bearer",
    "expiraEn": "2026-11-21T04:59:16.000Z",
    "usuario": { "id": 2, "nombre": "Ana Prueba", "correo": "ana@correo.test", "rol": "usuario", "creadoEn": "…" }
  }
}
```

Contenido (*payload*) del token: `{ "rol": "usuario", "sub": "2", "iat": …, "exp": …, "iss": "catalogo-api", "aud": "catalogo-api-clientes" }`. No contiene la contraseña.

**Errores**

| Estado | Código | Cuándo |
|---|---|---|
| 401 | `CREDENCIALES_INVALIDAS` | Correo no registrado **o** contraseña incorrecta: el mismo mensaje en ambos casos para no revelar qué correos existen. |
| 422 | `VALIDACION_FALLIDA` | Falta el correo o la contraseña, o el correo no tiene un formato válido. |

---

## Productos

Objeto producto:

```json
{
  "id": 4,
  "nombre": "Lámpara de escritorio Lumo",
  "descripcion": "Lámpara LED regulable con tres temperaturas de color y puerto USB.",
  "categoria": "Hogar",
  "precio": 28.75,
  "creadoEn": "2026-11-21T03:58:54.412Z",
  "actualizadoEn": "2026-11-21T03:58:54.412Z"
}
```

### `GET /productos`: público

Lista los productos ordenados por `id`.

| Parámetro de consulta | Reglas |
|---|---|
| `categoria` (opcional) | De 1 a 60 caracteres. Filtra por coincidencia exacta **sin distinguir mayúsculas** (`?categoria=hogar`). |

**200 OK**

```json
{ "data": [ { "id": 4, "nombre": "Lámpara de escritorio Lumo", "categoria": "Hogar", "precio": 28.75 } ], "meta": { "total": 3, "categoria": "hogar" } }
```

Si ninguna categoría coincide, devuelve `200` con `data: []`.

**Errores:** `400 FILTRO_INVALIDO` si `categoria` está vacío o repetido.

### `GET /productos/:id`: público

**200 OK** → `{ "data": <producto> }`

| Estado | Código | Cuándo |
|---|---|---|
| 400 | `PARAMETRO_INVALIDO` | `:id` no es un entero positivo (`/productos/abc`, `/productos/1.5`). |
| 404 | `PRODUCTO_NO_ENCONTRADO` | No existe un producto con ese id. |

### `POST /productos`: administrador

**Cabeceras:** `Authorization: Bearer <token de administrador>`

**Cuerpo**

| Campo | Tipo | Reglas |
|---|---|---|
| `nombre` | string | Obligatorio, de 2 a 120 caracteres; único sin distinguir mayúsculas. |
| `descripcion` | string | Obligatorio, de 1 a 1000 caracteres (no solo espacios). |
| `categoria` | string | Obligatorio, de 1 a 60 caracteres. |
| `precio` | number | Obligatorio, **mayor que 0**, máximo 2 decimales y como tope 99 999 999.99. |

Los campos no listados (por ejemplo `id` o `creadoEn`) se ignoran.

```json
{
  "nombre": "Mochila urbana Trazo",
  "descripcion": "Mochila impermeable con compartimento para portátil de 15 pulgadas.",
  "categoria": "Accesorios",
  "precio": 42.5
}
```

**201 Created** → `{ "data": <producto> }`, con la cabecera `Location: /api/productos/{id}`.

| Estado | Código | Cuándo |
|---|---|---|
| 401 | `TOKEN_*` | Sin token, o token vencido o inválido. |
| 403 | `PERMISO_DENEGADO` | El token es de un `usuario`. |
| 409 | `PRODUCTO_DUPLICADO` | Ya existe un producto con ese nombre. |
| 422 | `VALIDACION_FALLIDA` | Precio `<= 0`, no numérico o con más de 2 decimales; campos vacíos u obligatorios ausentes. |

### `PUT /productos/:id`: administrador

Reemplaza el producto completo, así que se envían **los cuatro campos** con las mismas reglas que en `POST`.

**200 OK** → `{ "data": <producto actualizado> }` (`actualizadoEn` cambia).

| Estado | Código | Cuándo |
|---|---|---|
| 400 | `PARAMETRO_INVALIDO` | `:id` inválido. |
| 401 / 403 | `TOKEN_*` / `PERMISO_DENEGADO` | Igual que en `POST`. |
| 404 | `PRODUCTO_NO_ENCONTRADO` | El producto no existe. |
| 409 | `PRODUCTO_DUPLICADO` | El nuevo nombre ya pertenece a otro producto. |
| 422 | `VALIDACION_FALLIDA` | Datos inválidos. |

### `DELETE /productos/:id`: administrador

Elimina el producto. **Sus favoritos se eliminan en cascada** (`ON DELETE CASCADE`), por lo que ningún usuario conserva favoritos huérfanos.

**204 No Content** (sin cuerpo).

| Estado | Código | Cuándo |
|---|---|---|
| 400 | `PARAMETRO_INVALIDO` | `:id` inválido. |
| 401 / 403 | `TOKEN_*` / `PERMISO_DENEGADO` | Sin token válido o sin rol administrador. |
| 404 | `PRODUCTO_NO_ENCONTRADO` | El producto no existe. |

---

## Favoritos

Todas las rutas requieren un **usuario autenticado** (cualquier rol). La identidad se obtiene **exclusivamente del token verificado** (`sub`), nunca de un identificador enviado por el cliente. Cada usuario solo ve y modifica sus propios favoritos.

Objeto favorito:

```json
{
  "productoId": 2,
  "agregadoEn": "2026-11-21T03:59:17.525Z",
  "producto": { "id": 2, "nombre": "Teclado mecánico Orbit", "descripcion": "…", "categoria": "Tecnología", "precio": 74.5, "creadoEn": "…", "actualizadoEn": "…" }
}
```

### `GET /favoritos`: autenticado

Lista los favoritos del usuario del token, del más reciente al más antiguo.

**200 OK** → `{ "data": [ <favorito> ], "meta": { "total": 1 } }`

**Errores:** `401 TOKEN_*`.

### `POST /favoritos`: autenticado

**Cuerpo**

| Campo | Tipo | Reglas |
|---|---|---|
| `productoId` | integer | Obligatorio, entero positivo. |

```json
{ "productoId": 2 }
```

Si se envía `"usuarioId"`, se ignora.

**201 Created** → `{ "data": <favorito> }`

| Estado | Código | Cuándo |
|---|---|---|
| 401 | `TOKEN_*` | Sin token válido. |
| 404 | `PRODUCTO_NO_ENCONTRADO` | El producto no existe. |
| 409 | `FAVORITO_DUPLICADO` | El producto ya está en los favoritos del usuario. |
| 422 | `VALIDACION_FALLIDA` | `productoId` ausente o no entero positivo. |

### `DELETE /favoritos/:productoId`: autenticado

Quita el producto de los favoritos **del usuario del token**.

**204 No Content** (sin cuerpo).

| Estado | Código | Cuándo |
|---|---|---|
| 400 | `PARAMETRO_INVALIDO` | `:productoId` no es un entero positivo. |
| 401 | `TOKEN_*` | Sin token válido. |
| 404 | `FAVORITO_NO_ENCONTRADO` | El producto no está en **sus** favoritos, aunque esté en los de otro usuario. No revela ni modifica datos ajenos. |

---

## Matriz de permisos

| Operación | Anónimo | `usuario` | `administrador` |
|---|:---:|:---:|:---:|
| Registrarse / iniciar sesión | ✅ | ✅ | ✅ |
| Listar y consultar productos | ✅ | ✅ | ✅ |
| Crear, actualizar y eliminar productos | ❌ 401 | ❌ 403 | ✅ |
| Listar, agregar y quitar **sus** favoritos | ❌ 401 | ✅ | ✅ |
| Ver o quitar favoritos de **otro** usuario | ❌ | ❌ (no hay forma de pedirlos) | ❌ |
