import {
  AuthRole,
  ROL_ADMINISTRADOR_GVR,
  ROL_ADMINISTRADOR_SISTEMAS,
} from '../../../domain/constants/auth-role.constants';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';

/** Admins que pueden gestionar cualquier entregable. */
export function esAdminGestionEntregables(rolesIds: number[]): boolean {
  return (
    rolesIds.includes(ROL_ADMINISTRADOR_SISTEMAS) ||
    rolesIds.includes(ROL_ADMINISTRADOR_GVR)
  );
}

export function esRolModeladorColaborador(rolesIds: number[]): boolean {
  return (
    rolesIds.includes(AuthRole.Modelador) ||
    rolesIds.includes(AuthRole.DesarrolladorWeb)
  );
}

export function esRolCoordinador(rolesIds: number[]): boolean {
  return rolesIds.includes(AuthRole.Coordinador);
}

/**
 * Quién puede editar/eliminar:
 * creador, responsable asignado, coordinador del proyecto, Admin Sistemas / Admin GVR.
 */
export async function puedeGestionarEntregable(
  repo: IProyectoRepository,
  params: {
    entregable: {
      idproyecto?: number;
      idusuariocreacion?: number | null;
      idtrabajadorresponsable?: number | null;
      responsables?: Array<{ idtrabajador?: number }>;
    };
    idUsuario: number;
    rolesIds: number[];
  },
): Promise<boolean> {
  const { entregable, idUsuario, rolesIds } = params;
  if (esAdminGestionEntregables(rolesIds)) return true;

  if (
    entregable.idusuariocreacion != null &&
    Number(entregable.idusuariocreacion) === Number(idUsuario)
  ) {
    return true;
  }

  const idTrabajador = await repo.obtenerIdTrabajadorPorIdUsuario(idUsuario);
  if (idTrabajador == null) return false;

  const responsablesIds = new Set<number>();
  if (
    entregable.idtrabajadorresponsable != null &&
    Number(entregable.idtrabajadorresponsable) > 0
  ) {
    responsablesIds.add(Number(entregable.idtrabajadorresponsable));
  }
  for (const r of entregable.responsables ?? []) {
    if (r?.idtrabajador != null && Number(r.idtrabajador) > 0) {
      responsablesIds.add(Number(r.idtrabajador));
    }
  }
  if (responsablesIds.has(idTrabajador)) return true;

  const idProyecto = Number(entregable.idproyecto);
  if (idProyecto > 0) {
    const esCoord = await repo.esCoordinadorEnProyecto(idProyecto, idTrabajador);
    if (esCoord) return true;
  }

  return false;
}

export async function responsablePerteneceAlProyecto(
  repo: IProyectoRepository,
  idProyecto: number,
  idTrabajadorResponsable: number,
): Promise<boolean> {
  return repo.trabajadorPerteneceAProyecto(idProyecto, idTrabajadorResponsable);
}
