import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { TRABAJADOR_REPOSITORY } from '../../../domain/repositories/trabajador.repository.interface';
import { UpdateTrabajadorDto } from '../../dtos/trabajador/update-trabajador.dto';

@Injectable()
export class EditarTrabajadorUseCase {
  constructor(
    @Inject(TRABAJADOR_REPOSITORY)
    private readonly trabajadorRepository: ITrabajadorRepository,
  ) {}

  async execute(
    idTrabajador: number,
    updateDto: UpdateTrabajadorDto,
    idUsuarioModificacion: number,
  ) {
    const { adjuntos, ...rest } = updateDto as UpdateTrabajadorDto & {
      adjuntos?: { idTipoAdjunto: number; ruta: string }[];
    };
    const resultado = await this.trabajadorRepository.editarTrabajador({
      idTrabajador,
      ...rest,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al editar el trabajador',
      );
    }

    await this.trabajadorRepository.eliminarAdjuntosPorTrabajador(idTrabajador);
    if (adjuntos?.length) {
      const valid = adjuntos.filter(
        (a) =>
          a?.idTipoAdjunto != null &&
          a?.ruta != null &&
          String(a.ruta).trim() !== '',
      );
      if (valid.length) {
        await this.trabajadorRepository.insertarAdjuntos(
          idTrabajador,
          valid,
          idUsuarioModificacion,
        );
      }
    }

    return {
      message: resultado.message,
    };
  }
}
