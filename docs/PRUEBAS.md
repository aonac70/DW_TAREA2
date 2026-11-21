# Evidencia de pruebas

Resultados de ejecutar la colección [postman/Catalogo.postman_collection.json](../postman/Catalogo.postman_collection.json) con `npm run test:postman`.

| Dato | Valor |
|---|---|
| Fecha de la ejecución registrada | 2026-11-21T04:04:22.032Z |
| Peticiones | 74 |
| Aserciones | 347 correctas de 347 |
| Reinicio del servidor | El proceso de Node.js se detuvo después de la fase 1 y la fase 2 se ejecutó contra un proceso nuevo con la misma base de datos. |

> Antes de entregar, ejecuten de nuevo `npm run test:postman` en su equipo y actualicen la fecha y los resultados con los suyos (el script genera `reportes/resultados-pruebas.md`).

## 1. Casos obligatorios

| N.º | Requisito | Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| 1 | Registro e inicio de sesión | Registro de usuario A con datos válidos | 201; rol `usuario`; sin contraseña ni hash | 201 Created; rol `usuario`; sin contraseña ni hash | ✅ |
| 2 | Registro e inicio de sesión | Registro enviando `"rol": "administrador"` | 201 con rol `usuario` (el rol se ignora) | 201 Created; rol `usuario` | ✅ |
| 3 | Registro e inicio de sesión | Inicio de sesión de usuario A | 200; JWT Bearer con `exp` > `iat` y `sub` = id | 200 OK; token de 3 partes con `exp` y `sub` correctos | ✅ |
| 4 | Registro e inicio de sesión | Registro con correo duplicado (en mayúsculas) | 409 `CORREO_DUPLICADO` | 409 Conflict `CORREO_DUPLICADO` | ✅ |
| 5 | Registro e inicio de sesión | Inicio de sesión con contraseña incorrecta | 401 `CREDENCIALES_INVALIDAS` | 401 Unauthorized `CREDENCIALES_INVALIDAS` | ✅ |
| 6 | Registro e inicio de sesión | Inicio de sesión con correo no registrado | 401 con el mismo mensaje que el caso anterior | 401 Unauthorized; mensaje idéntico | ✅ |
| 7 | CRUD y filtro | Listar productos sin token | 200; 5 o más productos con todos sus campos | 200 OK; 10 o más productos válidos | ✅ |
| 8 | CRUD y filtro | Filtrar por categoría `hogar` | 200; solo productos de Hogar | 200 OK; 3 productos, todos Hogar | ✅ |
| 9 | CRUD y filtro | Crear producto (administrador) | 201; datos guardados; cabecera `Location` | 201 Created; `Location: /api/productos/{id}` | ✅ |
| 10 | CRUD y filtro | Consultar el producto creado | 200 con el mismo id | 200 OK | ✅ |
| 11 | CRUD y filtro | Actualizar producto (administrador) | 200; nombre y precio nuevos | 200 OK; precio 30.75 | ✅ |
| 12 | CRUD y filtro | Eliminar producto (administrador) | 204 sin cuerpo | 204 No Content | ✅ |
| 13 | Validaciones | Crear producto con precio 0, negativo, texto o 3 decimales | 422 `VALIDACION_FALLIDA`, detalle en `precio` | 422 en los 4 casos | ✅ |
| 14 | Validaciones | Crear producto con campos vacíos / sin campos | 422 con detalle por campo | 422; detalles de nombre, descripción, categoría y precio | ✅ |
| 15 | Validaciones | JSON mal formado / id no numérico / filtro vacío | 400 `JSON_INVALIDO` / `PARAMETRO_INVALIDO` / `FILTRO_INVALIDO` | 400 en los 3 casos | ✅ |
| 16 | Validaciones | Consultar, actualizar o eliminar un producto inexistente | 404 `PRODUCTO_NO_ENCONTRADO` | 404 Not Found en los 3 casos | ✅ |
| 17 | Validaciones | Crear producto con nombre duplicado | 409 `PRODUCTO_DUPLICADO` | 409 Conflict | ✅ |
| 18 | 401 y 403 | Ruta protegida sin token | 401 `TOKEN_REQUERIDO` + `WWW-Authenticate` | 401 Unauthorized | ✅ |
| 19 | 401 y 403 | Ruta protegida con token vencido | 401 `TOKEN_EXPIRADO` | 401 Unauthorized `TOKEN_EXPIRADO` | ✅ |
| 20 | 401 y 403 | Token alterado para cambiar el rol a administrador | 401 `TOKEN_INVALIDO` | 401 Unauthorized `TOKEN_INVALIDO` | ✅ |
| 21 | 401 y 403 | Crear, actualizar y eliminar producto con rol usuario | 403 `PERMISO_DENEGADO`; el producto no cambia | 403 Forbidden en los 3 casos; producto intacto | ✅ |
| 22 | Favoritos | Agregar favorito (usuario A) | 201 con los datos del producto | 201 Created | ✅ |
| 23 | Favoritos | Listar favoritos (usuario A) | 200 con sus 2 favoritos | 200 OK; total 2 | ✅ |
| 24 | Favoritos | Quitar favorito (usuario A) | 204; ya no aparece en la lista | 204 No Content; lista actualizada | ✅ |
| 25 | Favoritos | Agregar favorito duplicado | 409 `FAVORITO_DUPLICADO` | 409 Conflict | ✅ |
| 26 | Favoritos | Agregar favorito de producto inexistente | 404 `PRODUCTO_NO_ENCONTRADO` | 404 Not Found | ✅ |
| 27 | Aislamiento A/B | B lista sus favoritos | 200; no contiene el favorito de A | 200 OK; lista vacía | ✅ |
| 28 | Aislamiento A/B | B intenta quitar el favorito de A | 404 `FAVORITO_NO_ENCONTRADO` | 404 Not Found | ✅ |
| 29 | Aislamiento A/B | B agrega un favorito enviando `usuarioId` de A | 201; queda en los favoritos de B, no de A | 201 Created; asociado a B | ✅ |
| 30 | Aislamiento A/B | A consulta sus favoritos | 200; su favorito permanece | 200 OK; favorito de A presente | ✅ |
| 31 | Consistencia | Eliminar un producto que A y B tenían en favoritos | Sus favoritos se eliminan en cascada | Ya no aparece en los favoritos de A ni de B; agregarlo da 404 | ✅ |
| 32 | Persistencia | Reiniciar Node.js y consultar `/salud` | `iniciadoEn` posterior (proceso nuevo) | PID distinto; `iniciadoEn` cambió | ✅ |
| 33 | Persistencia | Login de A y B tras el reinicio | 200 con los mismos ids | 200 OK; mismos ids | ✅ |
| 34 | Persistencia | Consultar el producto y los favoritos tras el reinicio | 200; nombre, precio y favoritos intactos | 200 OK; datos intactos | ✅ |
| 35 | Persistencia | Consultar el producto eliminado antes del reinicio | 404 | 404 Not Found | ✅ |

## 2. Detalle de las 74 peticiones

Cada petición indica en su nombre el código esperado. La columna *Aserciones* incluye las aserciones globales (JSON, formato de error, ausencia de contraseñas o hashes).

| # | Fase | Carpeta | Petición (resultado esperado) | HTTP obtenido | Aserciones | Resultado |
|---|------|---------|-------------------------------|---------------|------------|-----------|
| 1 | 1 | 00 Preparación | Salud del servicio → 200 | 200 | 4/4 | Correcto |
| 2 | 1 | 01 Autenticación | Registro usuario A → 201 | 201 | 5/5 | Correcto |
| 3 | 1 | 01 Autenticación | Registro usuario B → 201 | 201 | 4/4 | Correcto |
| 4 | 1 | 01 Autenticación | Registro enviando rol administrador → 201 con rol usuario | 201 | 4/4 | Correcto |
| 5 | 1 | 01 Autenticación | Registro con correo duplicado → 409 | 409 | 5/5 | Correcto |
| 6 | 1 | 01 Autenticación | Registro con datos inválidos → 422 | 422 | 6/6 | Correcto |
| 7 | 1 | 01 Autenticación | Login usuario A → 200 (JWT con vencimiento) | 200 | 6/6 | Correcto |
| 8 | 1 | 01 Autenticación | Login usuario B → 200 | 200 | 4/4 | Correcto |
| 9 | 1 | 01 Autenticación | Login administrador → 200 | 200 | 4/4 | Correcto |
| 10 | 1 | 01 Autenticación | Login con contraseña incorrecta → 401 | 401 | 5/5 | Correcto |
| 11 | 1 | 01 Autenticación | Login con correo no registrado → 401 | 401 | 6/6 | Correcto |
| 12 | 1 | 01 Autenticación | Login sin contraseña → 422 | 422 | 6/6 | Correcto |
| 13 | 1 | 02 Catálogo público (sin token) | Listar productos → 200 | 200 | 5/5 | Correcto |
| 14 | 1 | 02 Catálogo público (sin token) | Filtrar productos por categoría (hogar) → 200 | 200 | 5/5 | Correcto |
| 15 | 1 | 02 Catálogo público (sin token) | Filtrar por categoría sin productos → 200 lista vacía | 200 | 4/4 | Correcto |
| 16 | 1 | 02 Catálogo público (sin token) | Consultar producto por id → 200 | 200 | 4/4 | Correcto |
| 17 | 1 | 03 CRUD de productos (administrador) | Crear producto → 201 | 201 | 5/5 | Correcto |
| 18 | 1 | 03 CRUD de productos (administrador) | Consultar producto creado → 200 | 200 | 4/4 | Correcto |
| 19 | 1 | 03 CRUD de productos (administrador) | Actualizar producto → 200 | 200 | 5/5 | Correcto |
| 20 | 1 | 03 CRUD de productos (administrador) | Filtrar por la categoría del producto creado → 200 | 200 | 4/4 | Correcto |
| 21 | 1 | 03 CRUD de productos (administrador) | Eliminar producto → 204 | 204 | 3/3 | Correcto |
| 22 | 1 | 03 CRUD de productos (administrador) | Consultar producto eliminado → 404 | 404 | 5/5 | Correcto |
| 23 | 1 | 03 CRUD de productos (administrador) | Crear producto persistente → 201 | 201 | 4/4 | Correcto |
| 24 | 1 | 04 Validaciones y errores | Crear producto con precio 0 → 422 | 422 | 7/7 | Correcto |
| 25 | 1 | 04 Validaciones y errores | Crear producto con precio negativo → 422 | 422 | 6/6 | Correcto |
| 26 | 1 | 04 Validaciones y errores | Crear producto con precio no numérico → 422 | 422 | 6/6 | Correcto |
| 27 | 1 | 04 Validaciones y errores | Crear producto con precio de 3 decimales → 422 | 422 | 6/6 | Correcto |
| 28 | 1 | 04 Validaciones y errores | Crear producto con campos vacíos → 422 | 422 | 6/6 | Correcto |
| 29 | 1 | 04 Validaciones y errores | Crear producto sin campos obligatorios → 422 | 422 | 7/7 | Correcto |
| 30 | 1 | 04 Validaciones y errores | Crear producto con JSON mal formado → 400 | 400 | 5/5 | Correcto |
| 31 | 1 | 04 Validaciones y errores | Crear producto con nombre duplicado → 409 | 409 | 5/5 | Correcto |
| 32 | 1 | 04 Validaciones y errores | Actualizar producto con precio inválido → 422 | 422 | 6/6 | Correcto |
| 33 | 1 | 04 Validaciones y errores | Consultar producto inexistente → 404 | 404 | 5/5 | Correcto |
| 34 | 1 | 04 Validaciones y errores | Consultar producto con id inválido → 400 | 400 | 6/6 | Correcto |
| 35 | 1 | 04 Validaciones y errores | Actualizar producto inexistente → 404 | 404 | 5/5 | Correcto |
| 36 | 1 | 04 Validaciones y errores | Eliminar producto inexistente → 404 | 404 | 5/5 | Correcto |
| 37 | 1 | 04 Validaciones y errores | Filtro de categoría vacío → 400 | 400 | 6/6 | Correcto |
| 38 | 1 | 04 Validaciones y errores | Ruta inexistente → 404 | 404 | 5/5 | Correcto |
| 39 | 1 | 05 Seguridad: 401 y 403 | Favoritos sin token → 401 | 401 | 6/6 | Correcto |
| 40 | 1 | 05 Seguridad: 401 y 403 | Favoritos con token vencido → 401 | 401 | 6/6 | Correcto |
| 41 | 1 | 05 Seguridad: 401 y 403 | Crear producto con token manipulado → 401 | 401 | 5/5 | Correcto |
| 42 | 1 | 05 Seguridad: 401 y 403 | Crear producto sin token → 401 | 401 | 5/5 | Correcto |
| 43 | 1 | 05 Seguridad: 401 y 403 | Crear producto con rol usuario → 403 | 403 | 5/5 | Correcto |
| 44 | 1 | 05 Seguridad: 401 y 403 | Actualizar producto con rol usuario → 403 | 403 | 5/5 | Correcto |
| 45 | 1 | 05 Seguridad: 401 y 403 | Eliminar producto con rol usuario → 403 | 403 | 5/5 | Correcto |
| 46 | 1 | 05 Seguridad: 401 y 403 | El producto no cambió tras los intentos rechazados → 200 | 200 | 4/4 | Correcto |
| 47 | 1 | 06 Favoritos (usuario A) | Agregar favorito → 201 | 201 | 4/4 | Correcto |
| 48 | 1 | 06 Favoritos (usuario A) | Agregar segundo favorito → 201 | 201 | 3/3 | Correcto |
| 49 | 1 | 06 Favoritos (usuario A) | Agregar favorito duplicado → 409 | 409 | 5/5 | Correcto |
| 50 | 1 | 06 Favoritos (usuario A) | Agregar favorito de producto inexistente → 404 | 404 | 5/5 | Correcto |
| 51 | 1 | 06 Favoritos (usuario A) | Agregar favorito con productoId inválido → 422 | 422 | 6/6 | Correcto |
| 52 | 1 | 06 Favoritos (usuario A) | Listar favoritos → 200 | 200 | 4/4 | Correcto |
| 53 | 1 | 06 Favoritos (usuario A) | Quitar favorito → 204 | 204 | 3/3 | Correcto |
| 54 | 1 | 06 Favoritos (usuario A) | Listar favoritos tras quitar → 200 | 200 | 4/4 | Correcto |
| 55 | 1 | 06 Favoritos (usuario A) | Quitar favorito que no está en la lista → 404 | 404 | 5/5 | Correcto |
| 56 | 1 | 07 Aislamiento entre usuarios A y B | B lista sus favoritos: no ve los de A → 200 | 200 | 4/4 | Correcto |
| 57 | 1 | 07 Aislamiento entre usuarios A y B | B intenta quitar el favorito de A → 404 | 404 | 5/5 | Correcto |
| 58 | 1 | 07 Aislamiento entre usuarios A y B | B agrega un favorito enviando el usuarioId de A → 201 | 201 | 3/3 | Correcto |
| 59 | 1 | 07 Aislamiento entre usuarios A y B | B ve solo su propio favorito → 200 | 200 | 4/4 | Correcto |
| 60 | 1 | 07 Aislamiento entre usuarios A y B | A conserva su favorito y no recibió el de B → 200 | 200 | 5/5 | Correcto |
| 61 | 1 | 08 Consistencia al eliminar un producto | Crear producto temporal → 201 | 201 | 3/3 | Correcto |
| 62 | 1 | 08 Consistencia al eliminar un producto | A agrega el producto temporal a favoritos → 201 | 201 | 3/3 | Correcto |
| 63 | 1 | 08 Consistencia al eliminar un producto | B agrega el producto temporal a favoritos → 201 | 201 | 3/3 | Correcto |
| 64 | 1 | 08 Consistencia al eliminar un producto | Eliminar producto temporal → 204 | 204 | 2/2 | Correcto |
| 65 | 1 | 08 Consistencia al eliminar un producto | Favoritos de A ya no incluyen el producto eliminado → 200 | 200 | 4/4 | Correcto |
| 66 | 1 | 08 Consistencia al eliminar un producto | Favoritos de B ya no incluyen el producto eliminado → 200 | 200 | 4/4 | Correcto |
| 67 | 1 | 08 Consistencia al eliminar un producto | Agregar a favoritos el producto eliminado → 404 | 404 | 5/5 | Correcto |
| 68 | 2 | 09 Persistencia tras reinicio (reinicie el servidor antes) | El servidor fue reiniciado → 200 | 200 | 4/4 | Correcto |
| 69 | 2 | 09 Persistencia tras reinicio (reinicie el servidor antes) | Login usuario A tras reinicio → 200 | 200 | 4/4 | Correcto |
| 70 | 2 | 09 Persistencia tras reinicio (reinicie el servidor antes) | Login usuario B tras reinicio → 200 | 200 | 4/4 | Correcto |
| 71 | 2 | 09 Persistencia tras reinicio (reinicie el servidor antes) | El producto persistente sigue en la base → 200 | 200 | 4/4 | Correcto |
| 72 | 2 | 09 Persistencia tras reinicio (reinicie el servidor antes) | El favorito de A persiste → 200 | 200 | 4/4 | Correcto |
| 73 | 2 | 09 Persistencia tras reinicio (reinicie el servidor antes) | El favorito de B persiste → 200 | 200 | 4/4 | Correcto |
| 74 | 2 | 09 Persistencia tras reinicio (reinicie el servidor antes) | El producto eliminado sigue eliminado → 404 | 404 | 5/5 | Correcto |

## 3. Cómo reproducir

```bash
npm run db:setup        # una sola vez
npm run test:postman    # fase 1 → reinicio del servidor → fase 2
```

Para hacerlo manualmente en Postman, siga los pasos de la sección **Pruebas** del [README](../README.md#pruebas).
