import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import {
  ForbiddenError,
  InvalidInputError,
  NotFoundError,
} from '../../errors/application.error';
import { puedeGestionarEntregable } from './entregable-acceso.helper';

export class EliminarEntregableProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(
    idEntregable: number,
    idUsuarioModificacion: number,
    accesoTotal = false,
  ) {
    const actual =
      await this.proyectoRepository.obtenerEntregablePorId(idEntregable);
    if (!actual) {
      throw new NotFoundError('El entregable no existe o ya fue eliminado');
    }

    const puede = await puedeGestionarEntregable(this.proyectoRepository, {
      entregable: actual,
      idUsuario: idUsuarioModificacion,
      accesoTotal,
    });
    if (!puede) {
      throw new ForbiddenError(
        'No tienes permiso para eliminar este entregable',
      );
    }

    const resultado = await this.proyectoRepository.eliminarEntregableProyecto(
      idEntregable,
      idUsuarioModificacion,
    );

    if (!resultado?.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al eliminar el entregable',
      );
    }

    return resultado;
  }
}
