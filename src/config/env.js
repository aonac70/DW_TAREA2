
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const RUTA_ENV = fileURLToPath(new URL('../../.env', import.meta.url));

if (existsSync(RUTA_ENV)) {
  process.loadEnvFile(RUTA_ENV);
}

const puerto = (nombre, porDefecto) =>
  z.coerce
    .number({ error: `${nombre} debe ser un número.` })
    .int(`${nombre} debe ser un número entero.`)
    .min(1, `${nombre} debe estar entre 1 y 65535.`)
    .max(65535, `${nombre} debe estar entre 1 y 65535.`)
    .default(porDefecto);

const textoObligatorio = (nombre) =>
  z.string({ error: `${nombre} es obligatoria.` }).min(1, `${nombre} es obligatoria.`);

const esquemaEntorno = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: puerto('PORT', 3000),

  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: puerto('DB_PORT', 5432),
  DB_NAME: z
    .string({ error: 'DB_NAME es obligatoria.' })
    .regex(/^[A-Za-z_][A-Za-z0-9_]{0,62}$/, 'DB_NAME solo admite letras, números y guion bajo.'),
  DB_USER: textoObligatorio('DB_USER'),
  DB_PASSWORD: textoObligatorio('DB_PASSWORD'),

  JWT_SECRET: z
    .string({ error: 'JWT_SECRET es obligatoria.' })
    .min(32, 'JWT_SECRET debe tener al menos 32 caracteres (use un valor aleatorio).'),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^[1-9]\d*[smhd]$/, 'JWT_EXPIRES_IN debe tener el formato <número><s|m|h|d>, por ejemplo 1h.')
    .default('1h'),

  BCRYPT_SALT_ROUNDS: z.coerce
    .number()
    .int()
    .min(10, 'BCRYPT_SALT_ROUNDS debe estar entre 10 y 14.')
    .max(14, 'BCRYPT_SALT_ROUNDS debe estar entre 10 y 14.')
    .default(10),

  CORS_ORIGIN: z.string().min(1).default('*'),
});


const variables = Object.fromEntries(
  Object.entries(process.env).filter(([, valor]) => valor !== ''),
);

const resultado = esquemaEntorno.safeParse(variables);

if (!resultado.success) {
  console.error('[config] Configuración inválida. Revise su archivo .env (vea .env.example):');
  for (const problema of resultado.error.issues) {
    console.error(`  - ${problema.path.join('.')}: ${problema.message}`);
  }
  process.exit(1);
}

const e = resultado.data;

export const env = Object.freeze({
  nodeEnv: e.NODE_ENV,
  esProduccion: e.NODE_ENV === 'production',
  puerto: e.PORT,
  db: Object.freeze({
    host: e.DB_HOST,
    puerto: e.DB_PORT,
    nombre: e.DB_NAME,
    usuario: e.DB_USER,
    contrasena: e.DB_PASSWORD,
  }),
  jwt: Object.freeze({
    secreto: e.JWT_SECRET,
    expiraEn: e.JWT_EXPIRES_IN,
    algoritmo: 'HS256',
    emisor: 'catalogo-api',
    audiencia: 'catalogo-api-clientes',
  }),
  bcrypt: Object.freeze({ rondas: e.BCRYPT_SALT_ROUNDS }),
  cors: Object.freeze({
    origen: e.CORS_ORIGIN === '*' ? '*' : e.CORS_ORIGIN.split(',').map((origen) => origen.trim()),
  }),
});
