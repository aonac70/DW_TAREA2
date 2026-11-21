# Guion del video explicativo (10 a 15 minutos)

Duración estimada: **≈ 13 minutos**. Ambos integrantes hablan en partes equivalentes. **I1** = Integrante 1, **I2** = Integrante 2.

## Antes de grabar

- [ ] Pantalla compartida a 1080p; tamaño de fuente de VS Code y de Postman en **16–18 px** para que el código se lea.
- [ ] Micrófono probado y sin ruido de fondo.
- [ ] **No mostrar secretos:** no abrir `.env`. En Postman, ocultar el *Current value* de `adminContrasena`. Usar un `JWT_SECRET` y contraseñas de demostración que se cambien después de grabar.
- [ ] Base de datos limpia: `npm run db:reset && npm run db:admin`.
- [ ] Postman con la colección y el entorno importados, y `tokenVencido` ya cargado (`npm run token:vencido`).
- [ ] Dos terminales: una para `npm start` y otra para comandos.
- [ ] Grabar sobre el **commit final** que se indicará en el PDF (`git log -1 --format=%H`).

---

## 1. Presentación y propósito (0:00 – 1:00) · I1 e I2

**I1:** «Hola, soy *[nombre completo]*. En este proyecto me encargué de la base de datos, el CRUD de productos y las validaciones».

**I2:** «Y yo soy *[nombre completo]*. Me encargué de la autenticación con JWT, los roles, los favoritos y las pruebas de seguridad».

**I1:** «Desarrollamos una API REST con Node.js, Express y PostgreSQL que gestiona un catálogo de productos y los favoritos personales de cada usuario. El catálogo se puede consultar sin iniciar sesión. Solo el administrador modifica productos, y cada usuario autenticado administra únicamente sus propios favoritos».

## 2. Organización del proyecto y modelo de datos (1:00 – 2:45) · I1

Mostrar en VS Code:

1. **Árbol de `src/`**: «Separamos el código en capas: *routes* define la URL y los middlewares, *controllers* maneja HTTP, *services* aplica las reglas de negocio y *repositories* ejecuta SQL parametrizado. Además están `middlewares`, `validators` con Zod y `config`, donde las variables de entorno se validan al arrancar».
2. **Elección de PostgreSQL**: «Elegimos PostgreSQL porque los datos son relacionales: un favorito une un usuario con un producto. La base de datos nos garantiza la integridad con llaves foráneas, restricciones únicas y `CHECK`».
3. **`db/schema.sql`**: señalar
   - `usuarios_correo_unico` y `CHECK (correo = lower(correo))`;
   - `productos_precio_positivo CHECK (precio > 0)` y `NUMERIC(10,2)`;
   - `favoritos_pk PRIMARY KEY (usuario_id, producto_id)`: impide duplicados;
   - `ON DELETE CASCADE`: «Decidimos que al eliminar un producto se eliminen sus favoritos, así ningún usuario queda con favoritos que apuntan a productos inexistentes».
4. Mencionar `db/seed.sql` (10 productos ficticios) y `scripts/crear-admin.js`: «El administrador solo se crea con este script local, que lee las credenciales de `.env`».

## 3. Fragmento propio: operación CRUD (2:45 – 4:15) · I1

Abrir en orden **actualizar producto** (`PUT /productos/:id`):

1. `src/routes/productos.routes.js`: la cadena `soloAdministrador` → `validar({ params, body })` → `actualizar`.
2. `src/validators/productos.schemas.js`: reglas de `precio` (positivo, máximo 2 decimales) y campos obligatorios recortados. «Los campos que no están en el esquema se descartan: es una lista blanca».
3. `src/controllers/productos.controller.js` → `actualizar`: «El controlador solo lee `req.validado` y responde 200».
4. `src/services/productos.service.js` → `actualizar`: «Si el repositorio devuelve `null` respondemos 404. Si PostgreSQL lanza el error 23505 de nombre duplicado, lo traducimos a 409».
5. `src/repositories/productos.repository.js` → `actualizar`: «La consulta usa `$1…$5`. Los valores viajan separados del SQL, por eso no hay inyección. `RETURNING` nos devuelve la fila actualizada».
6. `src/repositories/mapeadores.js`: «`pg` devuelve `NUMERIC` como texto; lo convertimos a número para la respuesta».

## 4. Fragmento propio: JWT, roles y propiedad (4:15 – 6:00) · I2

1. `src/services/auth.service.js`:
   - `registrar`: «El rol se fija en `ROLES.USUARIO` aquí, en el servidor. Aunque el cliente envíe `rol`, Zod ya lo descartó».
   - `iniciarSesion`: «Comparamos con `bcrypt.compare`. Si el correo no existe, comparamos contra un hash ficticio: así la respuesta tarda lo mismo y el mensaje es el mismo, y no se revela qué correos existen».
2. `src/utils/jwt.js`: «Firmamos con HS256, con `sub` = id, el rol, emisor, audiencia y `expiresIn`. Al verificar fijamos el algoritmo permitido y `jwt.verify` valida la firma y la expiración».
3. `src/middlewares/autenticar.js`: «Si no hay cabecera, 401 `TOKEN_REQUERIDO`. Si `jwt.verify` lanza `TokenExpiredError`, 401 `TOKEN_EXPIRADO`. Cualquier otra falla, como una firma alterada, da 401 `TOKEN_INVALIDO`. Si todo está bien guardamos `req.usuario = { id, rol }`».
4. `src/middlewares/autorizar.js`: «Si el rol no está permitido, 403».
5. **Propiedad**: `src/controllers/favoritos.controller.js` y `src/repositories/favoritos.repository.js`: «El id del usuario sale siempre de `req.usuario.id`, nunca del cuerpo. Y todas las consultas filtran por `usuario_id = $1`, así un usuario no puede leer ni borrar favoritos ajenos: el `DELETE` de B sobre el favorito de A afecta 0 filas y responde 404».

## 5. Seguimiento de una petición de punta a punta (6:00 – 7:30) · I2

Usar **`POST /api/favoritos`** con el token del usuario A:

1. **Postman**: mostrar la URL, la pestaña *Authorization* (Bearer `{{tokenA}}`) y el cuerpo `{ "productoId": … }`. Enviar.
2. **`src/app.js`**: `express.json()` → `app.use('/api', rutas)`.
3. **`src/routes/index.js`** → `router.use('/favoritos', …)` → **`favoritos.routes.js`**: `autenticar` → `validar` → `agregar`.
4. **Controlador** → **servicio** (traduce 23505 → 409 y 23503 → 404) → **repositorio** (`INSERT … VALUES ($1, $2)` dentro de un CTE que devuelve el producto).
5. **Base de datos**: mostrar la fila nueva:

   ```bash
   docker exec -it catalogo-api-db psql -U catalogo -d catalogo -c "SELECT * FROM favoritos ORDER BY creado_en DESC LIMIT 3;"
   ```

   (o pgAdmin si usan PostgreSQL local).
6. **Respuesta**: volver a Postman y mostrar `201` y el JSON `{ "data": { "productoId", "agregadoEn", "producto": {…} } }`, más los *Test Results* en verde.

## 6. Demostración de las pruebas (7:30 – 11:30) · I1 e I2

| Tiempo | Quién | Qué ejecutar en Postman | Qué decir |
|---|---|---|---|
| 7:30 | I1 | Carpetas **00 → 03** con el Runner | «Flujo exitoso: registro, login, consulta pública, filtro por categoría y CRUD completo como administrador con 201, 200 y 204». |
| 8:30 | I1 | Carpeta **04**: abrir *precio 0* y *campos vacíos* | «Datos inválidos: 422 con `detalles` por campo. Un JSON mal formado o un id no numérico da 400: ese es nuestro criterio entre 400 y 422». |
| 9:15 | I2 | Carpeta **05**: sin token, token vencido, token manipulado, rol usuario | «Sin token o con token vencido: 401. Si alteramos el rol dentro del token, la firma ya no coincide: 401. Con rol usuario: 403, y el producto no cambia». |
| 10:00 | I2 | Carpetas **06 y 07** | «A agrega, lista y quita favoritos; el duplicado da 409 y el producto inexistente 404. B no ve los favoritos de A, no puede quitarlos (404) y, aunque envíe el `usuarioId` de A, el favorito queda para B. El favorito de A permanece». |
| 10:45 | I1 | Carpeta **08**, luego **Ctrl+C**, `npm start` y la carpeta **09** | «Al borrar un producto se eliminan sus favoritos en cascada. Ahora reiniciamos Node.js: `iniciadoEn` cambió, así que es un proceso nuevo, y los usuarios, el producto y los favoritos siguen en la base de datos». |
| 11:15 | I2 | En la terminal: `npm run test:postman` (mostrar el resumen final) | «Automatizamos todo con Newman: el script reinicia el servidor entre las dos fases. 74 peticiones y 347 aserciones correctas». |

## 7. Dificultad encontrada y solución (11:30 – 12:30) · I1 o I2

Elijan **una** dificultad que hayan vivido. Ejemplos reales de este proyecto:

- **Errores de sintaxis en los scripts de Postman.** Al declarar `const data = …` o `const CryptoJS = …` en los tests, Newman marcaba `SyntaxError`. **Causa:** el sandbox de Postman ya define `data` y `CryptoJS` como variables globales heredadas. **Solución:** renombrarlas (`datos`, `cripto`).
- **Probar el token vencido sin publicar el secreto.** No podíamos guardar `JWT_SECRET` en el entorno de Postman. **Solución:** el script `npm run token:vencido` firma localmente un token ya expirado, y `npm run test:postman` lo inyecta en tiempo de ejecución.
- **Demostrar la persistencia de forma reproducible.** **Solución:** `GET /salud` devuelve `iniciadoEn`; el script de pruebas detiene el proceso, arranca uno nuevo y la carpeta 09 verifica que `iniciadoEn` cambió y que los datos siguen ahí.
- **`pg` devolvía el precio como texto** (`"28.75"`), porque así representa `NUMERIC` sin perder precisión. **Solución:** convertirlo con `Number()` en el mapeador.

## 8. Cómo ejecutar desde el repositorio y cierre (12:30 – 13:30) · I2 e I1

Mostrar el README en GitHub y decir los pasos:

```bash
git clone https://github.com/aonac70/DW_TAREA2.git
cd DW_TAREA2
npm ci
cp .env.example .env      # completar DB_PASSWORD, JWT_SECRET y ADMIN_CONTRASENA
docker compose up -d      # o usar un PostgreSQL local
npm run db:setup
npm start
npm run test:postman
```

**I1:** «En el README están las variables de entorno, las rutas, el criterio de códigos de estado y los pasos de prueba».
**I2:** «Gracias por su atención».

---

### Lista de verificación final del video

- [ ] Duración entre 10 y 15 minutos.
- [ ] Ambos se identifican y explican código.
- [ ] Se ven: propósito, organización, modelo de datos, aportes de cada uno.
- [ ] Se explican: una operación CRUD, la verificación del JWT y el control de rol y de propiedad.
- [ ] Se sigue una petición: Postman → ruta → controlador → base de datos → JSON.
- [ ] Se demuestran: flujo exitoso, validación, permisos, aislamiento A/B, persistencia tras reiniciar.
- [ ] Una dificultad y su solución; cómo ejecutar desde el repositorio.
- [ ] No se ven secretos (`.env`, contraseñas reales).
- [ ] Subido a YouTube **no listado** o a Drive con acceso de lectura por enlace; enlace probado en una **ventana privada**.
