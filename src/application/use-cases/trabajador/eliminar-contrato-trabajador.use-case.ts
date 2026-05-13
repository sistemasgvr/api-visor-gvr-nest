import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { TRABAJADOR_REPOSITORY } from '../../../domain/repositories/trabajador.repository.interface';

@Injectable()
export class EliminarContratoTrabajadorUseCase {
  constructor(
    @Inject(TRABAJADOR_REPOSITORY)
    private readonly trabajadorRepository: ITrabajadorRepository,
  ) {}

  async execute(
    idTrabajador: number,
    idContrato: number,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.trabajadorRepository.eliminarContratoTrabajador({
      idContrato,
      idTrabajador,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al eliminar el contrato',
      );
    }

    return { message: resultado.message };
  }
}
