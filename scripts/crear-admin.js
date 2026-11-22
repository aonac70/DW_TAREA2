import '../src/config/env.js'; // carga y valida .env
import { cerrarPool } from '../src/db/pool.js';
import { guardarAdministrador } from '../src/repositories/usuarios.repository.js';
import { generarHash } from '../src/services/auth.service.js';
import { registroSchema } from '../src/validators/auth.schemas.js';

const VARIABLES = { nombre: 'ADMIN_NOMBRE', correo: 'ADMIN_CORREO', contrasena: 'ADMIN_CONTRASENA' };
async function main() {
  const resultado = registroSchema.safeParse({
    nombre: process.env.ADMIN_NOMBRE,
    correo: process.env.ADMIN_CORREO,
    contrasena: process.env.ADMIN_CONTRASENA,
  });

  if (!resultado.success) {
    console.error('[admin] Variables de administrador inválidas en .env:');
    for (const problema of resultado.error.issues) {
      console.error(`  - ${VARIABLES[problema.path[0]] ?? problema.path.join('.')}: ${problema.message}`);
    }
    process.exitCode = 1;
    return;
  }

  const { nombre, correo, contrasena } = resultado.data;
  const administrador = await guardarAdministrador({
    nombre,
    correo,
    contrasenaHash: await generarHash(contrasena),
  });

  console.log(
    `[admin] Administrador listo: ${administrador.correo} (id ${administrador.id}, rol ${administrador.rol}).`,
  );
}

main()
  .catch((error) => {
    console.error('[admin] No se pudo crear el administrador:', error.message);
    console.error('[admin] ¿Ejecutó antes "npm run db:init"?');
    process.exitCode = 1;
  })
  .finally(() => cerrarPool());
