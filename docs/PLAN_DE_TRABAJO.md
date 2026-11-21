# Plan de trabajo y de commits

La tarea pide un **historial de commits con aportes identificables de ambos integrantes**. Este plan divide el proyecto en módulos y propone el orden de los commits siguiendo la recomendación del enunciado: *primero el CRUD con persistencia, después JWT y permisos*.

Cada integrante debe hacer **sus commits desde su propia cuenta de GitHub**, con su nombre y correo configurados en Git, y **entender el código que sube** porque lo explicará en el video.

## 1. División de responsabilidades

| Módulo | Integrante 1 | Integrante 2 |
|---|:---:|:---:|
| Configuración del proyecto (npm, ESLint, `.env.example`, Docker) | ✅ | |
| Esquema SQL, datos de ejemplo, conexión y `db-init` | ✅ | |
| CRUD de productos + filtro (repositorio, servicio, controlador, rutas) | ✅ | |
| Validaciones (Zod) y manejo central de errores | ✅ | revisión |
| Registro, login, hash de contraseñas y JWT | | ✅ |
| Middlewares `autenticar` / `autorizar`; script del administrador | | ✅ |
| Favoritos (aislamiento por usuario) | | ✅ |
| Colección de Postman y script de pruebas con reinicio | carpetas 02–04 | carpetas 00, 01, 05–09 y script |
| README y `docs/API.md` | ✅ | revisión |
| `docs/PRUEBAS.md`, guion del video | revisión | ✅ |
| Video y PDF de entrega | ✅ | ✅ |

## 2. Preparación de Git (una vez por integrante)

```bash
git config --global user.name  "Nombre Apellido"
git config --global user.email "correo-de-su-cuenta@ejemplo.com"
```

**Integrante 1** crea el repositorio **público** en GitHub, sin README inicial, y agrega al Integrante 2 como colaborador (*Settings → Collaborators*).

## 3. Commits propuestos

### Integrante 1

```bash
git init
git branch -M main
git remote add origin https://github.com/<usuario>/<repositorio>.git
```

**Commit 1: estructura inicial**

```bash
git add package.json package-lock.json .gitignore .gitattributes .editorconfig eslint.config.js .env.example docker-compose.yml
git commit -m "chore: estructura inicial del proyecto y configuración"
```

**Commit 2: base de datos**

```bash
git add db/ src/config/env.js src/db/ scripts/db-init.js
git commit -m "feat(db): esquema PostgreSQL, datos de ejemplo y conexión"
```

**Commit 3: CRUD de productos con persistencia (todavía sin seguridad)**

En este commit, `src/routes/index.js` y `src/routes/productos.routes.js` van **sin** autenticación. El Integrante 2 la agrega en los commits 4 a 6. Versión de este commit:

```js
// src/routes/index.js (versión del commit 3)
import { Router } from 'express';
import { consultarSalud } from '../controllers/salud.controller.js';
import productosRutas from './productos.routes.js';

const router = Router();
router.get('/salud', consultarSalud);
router.use('/productos', productosRutas);
export default router;
```

```js
// src/routes/productos.routes.js (versión del commit 3): sin soloAdministrador
router.get('/', validar({ query: filtroProductosQuery }), productosControlador.listar);
router.get('/:id', validar({ params: idProductoParams }), productosControlador.obtener);
router.post('/', validar({ body: productoSchema }), productosControlador.crear);
router.put('/:id', validar({ params: idProductoParams, body: productoSchema }), productosControlador.actualizar);
router.delete('/:id', validar({ params: idProductoParams }), productosControlador.eliminar);
```

```bash
git add src/app.js src/server.js src/routes/index.js src/routes/productos.routes.js \
        src/controllers/productos.controller.js src/controllers/salud.controller.js \
        src/services/productos.service.js src/repositories/productos.repository.js \
        src/repositories/mapeadores.js src/validators/comunes.js src/validators/productos.schemas.js \
        src/middlewares/validar.js src/middlewares/manejadorErrores.js src/middlewares/rutaNoEncontrada.js \
        src/utils/errores.js src/utils/respuestas.js
git commit -m "feat(productos): CRUD con persistencia, filtro por categoría y validaciones"
git push -u origin main
```

### Integrante 2

```bash
git clone https://github.com/<usuario>/<repositorio>.git
cd <repositorio>
npm ci
```

**Commit 4: registro e inicio de sesión**

Agregar en `src/routes/index.js` la línea `router.use('/auth', authRutas);` y su `import`.

```bash
git add src/config/roles.js src/utils/jwt.js src/validators/auth.schemas.js \
        src/repositories/usuarios.repository.js src/services/auth.service.js \
        src/controllers/auth.controller.js src/routes/auth.routes.js src/routes/index.js
git commit -m "feat(auth): registro con rol usuario e inicio de sesión con JWT"
```

**Commit 5: autenticación, roles y administrador**

Restaurar en `src/routes/productos.routes.js` la constante `soloAdministrador` en `POST`, `PUT` y `DELETE`.

```bash
git add src/middlewares/autenticar.js src/middlewares/autorizar.js src/routes/productos.routes.js \
        scripts/crear-admin.js scripts/token-vencido.js
git commit -m "feat(auth): verificación de JWT, control por rol y script del administrador"
```

**Commit 6: favoritos**

Agregar en `src/routes/index.js` la línea `router.use('/favoritos', favoritosRutas);` y su `import`.

```bash
git add src/validators/favoritos.schemas.js src/repositories/favoritos.repository.js \
        src/services/favoritos.service.js src/controllers/favoritos.controller.js \
        src/routes/favoritos.routes.js src/routes/index.js
git commit -m "feat(favoritos): agregar, listar y quitar favoritos aislados por usuario"
```

**Commit 7: pruebas**

```bash
git add postman/ scripts/pruebas-postman.js
git commit -m "test: colección de Postman con aserciones y pruebas con reinicio del servidor"
git push
```

### Cierre (ambos)

```bash
# Integrante 1
git pull
git add README.md docs/API.md
git commit -m "docs: README y referencia de la API"
git push

# Integrante 2
git pull
git add docs/PRUEBAS.md docs/GUION_VIDEO.md docs/PLAN_DE_TRABAJO.md
git commit -m "docs: evidencia de pruebas, guion del video y plan de trabajo"
git push
```

## 4. Comprobaciones antes de entregar

```bash
git status                    # no debe aparecer .env ni node_modules
git ls-files | grep -E "^\.env$|node_modules" || echo "OK: sin secretos ni dependencias"
git log --format="%h %an %s"  # deben aparecer commits de ambos integrantes
git log -1 --format=%H        # identificador del commit final para el PDF
```

- Clonar el repositorio en otra carpeta y seguir el README desde cero (`npm ci`, `.env`, `npm run db:setup`, `npm run test:postman`).
- Abrir el enlace del repositorio y el del video en una **ventana privada**.
- El video y el PDF deben corresponder al **commit final** indicado.
