import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { TRABAJADOR_REPOSITORY } from '../../../domain/repositories/trabajador.repository.interface';

@Injectable()
export class ActivarTrabajadorUseCase {
  constructor(
    @Inject(TRABAJADOR_REPOSITORY)
    private readonly trabajadorRepository: ITrabajadorRepository,
  ) {}

  async execute(idTrabajador: number, idUsuarioModificacion: number) {
    const resultado = await this.trabajadorRepository.activarTrabajador(
      idTrabajador,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al activar el trabajador',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
