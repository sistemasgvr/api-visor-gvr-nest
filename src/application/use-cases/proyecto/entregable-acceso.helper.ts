import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';

/**
 * Quién puede editar/eliminar: con alcance «todos» del permiso, cualquier entregable;
 * con «asignados», el creador, un responsable o el coordinador del proyecto.
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
    accesoTotal: boolean;
  },
): Promise<boolean> {
  const { entregable, idUsuario, accesoTotal } = params;
  if (accesoTotal) return true;

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
    const esCoord = await repo.esCoordinadorEnProyecto(
      idProyecto,
      idTrabajador,
    );
    if (esCoord) return true;
  }

  return false;
}

/** «asignados»: la persona participa en el proyecto (acceso, equipo o coordinación). */
export async function participaEnProyecto(
  repo: IProyectoRepository,
  idProyecto: number,
  idUsuario: number,
): Promise<boolean> {
  const idTrabajador = await repo.obtenerIdTrabajadorPorIdUsuario(idUsuario);
  if (idTrabajador == null || !(idProyecto > 0)) return false;
  return (
    (await repo.trabajadorPerteneceAProyecto(idProyecto, idTrabajador)) ||
    (await repo.esCoordinadorEnProyecto(idProyecto, idTrabajador))
  );
}

export async function responsablePerteneceAlProyecto(
  repo: IProyectoRepository,
  idProyecto: number,
  idTrabajadorResponsable: number,
): Promise<boolean> {
  return repo.trabajadorPerteneceAProyecto(idProyecto, idTrabajadorResponsable);
}
