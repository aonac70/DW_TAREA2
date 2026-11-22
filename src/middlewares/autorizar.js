
import { accesoDenegado, noAutenticado } from '../utils/errores.js';

export function autorizar(...rolesPermitidos) {
  return (req, _res, next) => {
    if (!req.usuario) {
      throw noAutenticado('TOKEN_REQUERIDO', 'Se requiere un token de acceso.');
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      throw accesoDenegado('No tiene permisos para realizar esta acción.');
    }
    next();
  };
}
