import {
  Injectable,
  Inject,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';
import { puedeGestionarEntregable } from './entregable-acceso.helper';

@Injectable()
export class EliminarEntregableProyectoUseCase {
  constructor(
    @Inject(PROYECTO_REPOSITORY)
    private readonly proyectoRepository: IProyectoRepository,
  ) {}

  async execute(
    idEntregable: number,
    idUsuarioModificacion: number,
    rolesIds: number[] = [],
  ) {
    const actual =
      await this.proyectoRepository.obtenerEntregablePorId(idEntregable);
    if (!actual) {
      throw new NotFoundException('El entregable no existe o ya fue eliminado');
    }

    const puede = await puedeGestionarEntregable(this.proyectoRepository, {
      entregable: actual,
      idUsuario: idUsuarioModificacion,
      rolesIds,
    });
    if (!puede) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este entregable',
      );
    }

    const resultado = await this.proyectoRepository.eliminarEntregableProyecto(
      idEntregable,
      idUsuarioModificacion,
    );

    if (!resultado?.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al eliminar el entregable',
      );
    }

    return resultado;
  }
}
