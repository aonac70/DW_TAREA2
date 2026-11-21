/**
 * Ejecuta la colección de Postman con Newman y demuestra la persistencia con un reinicio real:
 *
 *   Fase 1  → inicia el servidor (proceso Node.js nuevo) y ejecuta todas las carpetas
 *             excepto "Persistencia tras reinicio".
 *   Reinicio→ detiene ese proceso y arranca uno nuevo (misma base de datos).
 *   Fase 2  → ejecuta la carpeta "Persistencia tras reinicio" con las variables de la fase 1
 *             (ids de productos, correos, etc.) y comprueba que los registros siguen ahí.
 *
 *   npm run test:postman
 *
 * Requisitos: PostgreSQL en ejecución, `npm run db:setup` ejecutado y las variables
 * ADMIN_CORREO / ADMIN_CONTRASENA definidas en .env. Usa el puerto PUERTO_PRUEBAS (3100 por
 * defecto) para no chocar con un servidor que ya esté corriendo en PORT.
 * Al final escribe un resumen en reportes/resultados-pruebas.md.
 */
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import newman from 'newman';
import { ROLES } from '../src/config/roles.js';
import { firmarToken } from '../src/utils/jwt.js';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const RUTA_COLECCION = path.join(RAIZ, 'postman', 'Catalogo.postman_collection.json');
const RUTA_ENTORNO = path.join(RAIZ, 'postman', 'Catalogo.postman_environment.json');
const RUTA_REPORTE = path.join(RAIZ, 'reportes', 'resultados-pruebas.md');
const PUERTO = Number(process.env.PUERTO_PRUEBAS ?? 3100);
const BASE_URL = `http://localhost:${PUERTO}/api`;
const MARCA_PERSISTENCIA = 'Persistencia';

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

async function servidorResponde() {
  try {
    const respuesta = await fetch(`${BASE_URL}/salud`);
    return respuesta.ok ? (await respuesta.json()).data : null;
  } catch {
    return null;
  }
}

function iniciarServidor() {
  const proceso = spawn(process.execPath, [path.join(RAIZ, 'src', 'server.js')], {
    cwd: RAIZ,
    env: { ...process.env, PORT: String(PUERTO), NODE_ENV: 'test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  proceso.stdout.on('data', (datos) => process.stdout.write(`  [servidor] ${datos}`));
  proceso.stderr.on('data', (datos) => process.stderr.write(`  [servidor] ${datos}`));
  return proceso;
}

async function esperarServidor(proceso, limiteMs = 20_000) {
  const inicio = Date.now();
  while (Date.now() - inicio < limiteMs) {
    if (proceso.exitCode !== null) throw new Error('El servidor terminó al iniciar (revise el mensaje anterior).');
    const salud = await servidorResponde();
    if (salud) return salud;
    await esperar(250);
  }
  throw new Error(`El servidor no respondió en ${limiteMs / 1000} s.`);
}

function detenerServidor(proceso) {
  if (!proceso || proceso.exitCode !== null) return Promise.resolve();
  return new Promise((resolver) => {
    proceso.once('exit', resolver);
    proceso.kill('SIGTERM');
  });
}

function ejecutarNewman(opciones) {
  return new Promise((resolver, rechazar) => {
    newman.run({ reporters: ['cli'], ...opciones }, (error, resumen) =>
      error ? rechazar(error) : resolver(resumen),
    );
  });
}

/** Extrae, por cada petición ejecutada, el código HTTP obtenido y el resultado de sus aserciones. */
function resumirEjecuciones(resumen, fase) {
  return resumen.run.executions.map((ejecucion) => {
    const aserciones = ejecucion.assertions ?? [];
    const fallidas = aserciones.filter((asercion) => asercion.error);
    return {
      fase,
      carpeta: ejecucion.item.parent()?.name ?? '',
      peticion: ejecucion.item.name,
      codigo: ejecucion.response?.code ?? '—',
      total: aserciones.length,
      fallidas: fallidas.map((asercion) => asercion.assertion),
    };
  });
}

async function escribirReporte(filas) {
  const totalAserciones = filas.reduce((suma, fila) => suma + fila.total, 0);
  const totalFallidas = filas.reduce((suma, fila) => suma + fila.fallidas.length, 0);
  const lineas = [
    '# Resultados de las pruebas (Newman)',
    '',
    `- Fecha de ejecución: ${new Date().toISOString()}`,
    `- Peticiones ejecutadas: ${filas.length}`,
    `- Aserciones: ${totalAserciones - totalFallidas} correctas de ${totalAserciones}`,
    '- Entre la fase 1 y la fase 2 el proceso de Node.js se detuvo y se inició de nuevo.',
    '',
    '| # | Fase | Carpeta | Petición (resultado esperado) | HTTP obtenido | Aserciones | Resultado |',
    '|---|------|---------|-------------------------------|---------------|------------|-----------|',
    ...filas.map(
      (fila, indice) =>
        `| ${indice + 1} | ${fila.fase} | ${fila.carpeta} | ${fila.peticion} | ${fila.codigo} | ` +
        `${fila.total - fila.fallidas.length}/${fila.total} | ` +
        `${fila.fallidas.length ? `FALLÓ: ${fila.fallidas.join('; ')}` : 'Correcto'} |`,
    ),
    '',
  ];
  await mkdir(path.dirname(RUTA_REPORTE), { recursive: true });
  await writeFile(RUTA_REPORTE, lineas.join('\n'), 'utf8');
  return { totalAserciones, totalFallidas };
}

async function main() {
  const { ADMIN_CORREO, ADMIN_CONTRASENA } = process.env;
  if (!ADMIN_CORREO || !ADMIN_CONTRASENA) {
    throw new Error('Defina ADMIN_CORREO y ADMIN_CONTRASENA en .env y ejecute "npm run db:admin".');
  }
  if (await servidorResponde()) {
    throw new Error(`Ya hay un servidor en el puerto ${PUERTO}. Deténgalo o defina PUERTO_PRUEBAS.`);
  }

  const coleccion = JSON.parse(await readFile(RUTA_COLECCION, 'utf8'));
  const carpetas = coleccion.item.map((carpeta) => carpeta.name);
  const carpetasFase1 = carpetas.filter((nombre) => !nombre.includes(MARCA_PERSISTENCIA));
  const carpetasFase2 = carpetas.filter((nombre) => nombre.includes(MARCA_PERSISTENCIA));

  // Variables inyectadas en tiempo de ejecución: nunca se guardan en el repositorio.
  const variables = [
    { key: 'baseUrl', value: BASE_URL },
    { key: 'adminCorreo', value: ADMIN_CORREO },
    { key: 'adminContrasena', value: ADMIN_CONTRASENA },
    { key: 'tokenVencido', value: firmarToken({ id: 1, rol: ROLES.USUARIO }, { expiraEn: -60 }).token },
  ];

  let servidor;
  try {
    console.log(`\n=== Fase 1: servidor nuevo en ${BASE_URL} ===`);
    servidor = iniciarServidor();
    const salud1 = await esperarServidor(servidor);
    console.log(`  Proceso PID ${servidor.pid} iniciado en ${salud1.iniciadoEn}`);
    const fase1 = await ejecutarNewman({
      collection: coleccion,
      environment: RUTA_ENTORNO,
      folder: carpetasFase1,
      envVar: variables,
    });

    console.log('\n=== Reinicio: deteniendo el proceso de Node.js ===');
    await detenerServidor(servidor);
    console.log(`  Proceso PID ${servidor.pid} detenido.`);
    servidor = iniciarServidor();
    const salud2 = await esperarServidor(servidor);
    console.log(`  Nuevo proceso PID ${servidor.pid} iniciado en ${salud2.iniciadoEn}`);

    console.log('\n=== Fase 2: persistencia tras el reinicio ===');
    const fase2 = await ejecutarNewman({
      collection: coleccion,
      environment: fase1.environment.toJSON(), // ids y correos creados en la fase 1
      folder: carpetasFase2,
      envVar: variables,
    });

    const filas = [...resumirEjecuciones(fase1, 1), ...resumirEjecuciones(fase2, 2)];
    const { totalAserciones, totalFallidas } = await escribirReporte(filas);
    const fallos = fase1.run.failures.length + fase2.run.failures.length;

    console.log(`\nResumen: ${filas.length} peticiones, ${totalAserciones - totalFallidas}/${totalAserciones} aserciones correctas.`);
    console.log(`Reporte: ${path.relative(RAIZ, RUTA_REPORTE)}`);
    if (fallos > 0 || totalFallidas > 0) {
      console.error(`Hay ${Math.max(fallos, totalFallidas)} fallo(s). Revise la salida anterior.`);
      process.exitCode = 1;
    }
  } finally {
    await detenerServidor(servidor);
  }
}

main().catch((error) => {
  console.error(`\n[pruebas] ${error.message}`);
  process.exitCode = 1;
});
