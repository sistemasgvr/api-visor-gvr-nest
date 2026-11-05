import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';

/** Administración es quien tiene este permiso con alcance «todos»; se ajusta desde Roles y permisos. */
export const PERMISO_ADMINISTRACION_PLAN = 'proyectos.planificacion.configurar';

/** El aprobador debe ser coordinador del proyecto o de administración. */
export async function exigirAprobadorValido(
  repository: IPlanificacionRepository,
  actor: number,
  idProyecto: number,
  idAprobador: number,
) {
  const candidatos = await repository.listarAprobadoresPlan(
    actor,
    idProyecto,
    PERMISO_ADMINISTRACION_PLAN,
  );
  if (!candidatos.some((c) => c.idtrabajador === idAprobador))
    throw new InvalidInputError(
      'El aprobador debe ser coordinador del proyecto o una persona de administración.',
    );
}
