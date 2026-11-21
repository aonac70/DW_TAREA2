-- =============================================================================
-- ¡Destructivo! Elimina todas las tablas y sus datos.
-- Solo se ejecuta con: npm run db:reset (bloqueado cuando NODE_ENV=production).
-- =============================================================================
DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS usuarios;
