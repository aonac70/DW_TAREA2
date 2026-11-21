/** Roles disponibles en el sistema. Deben coincidir con la restricción CHECK de la tabla usuarios. */
export const ROLES = Object.freeze({
  ADMINISTRADOR: 'administrador',
  USUARIO: 'usuario',
});

export const LISTA_ROLES = Object.freeze(Object.values(ROLES));
