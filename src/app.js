/**
 * Configuración de la aplicación Express (sin abrir el puerto).
 * Separar app.js de server.js permite reutilizar la app en pruebas y scripts.
 */
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { manejadorErrores } from './middlewares/manejadorErrores.js';
import { rutaNoEncontrada } from './middlewares/rutaNoEncontrada.js';
import rutas from './routes/index.js';

export function crearApp() {
  const app = express();

  app.use(helmet()); // cabeceras de seguridad (y oculta X-Powered-By)
  app.use(cors({ origin: env.cors.origen }));
  app.use(express.json({ limit: '10kb' })); // limita el tamaño del cuerpo

  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.esProduccion ? 'combined' : 'dev'));
  }

  app.use('/api', rutas);

  app.use(rutaNoEncontrada);
  app.use(manejadorErrores);

  return app;
}
