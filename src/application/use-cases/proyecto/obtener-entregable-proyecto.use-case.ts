import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { ForbiddenError, NotFoundError } from '../../errors/application.error';
import {
  participaEnProyecto,
  puedeGestionarEntregable,
} from './entregable-acceso.helper';

export class ObtenerEntregableProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(idEntregable: number, idUsuario: number, accesoTotal: boolean) {
    const entregable = (await this.proyectoRepository.obtenerEntregablePorId(
      idEntregable,
    )) as Parameters<typeof puedeGestionarEntregable>[1]['entregable'] | null;

    if (!entregable) {
      throw new NotFoundError('Entregable no encontrado');
    }
    // «asignados»: participa en el proyecto o gestiona el entregable.
    if (
      !accesoTotal &&
      !(await participaEnProyecto(
        this.proyectoRepository,
        Number(entregable.idproyecto),
        idUsuario,
      )) &&
      !(await puedeGestionarEntregable(this.proyectoRepository, {
        entregable,
        idUsuario,
        accesoTotal,
      }))
    ) {
      throw new ForbiddenError('No tienes permiso para ver este entregable');
    }

    return entregable;
  }
}
