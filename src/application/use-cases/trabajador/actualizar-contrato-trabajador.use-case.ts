import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { TRABAJADOR_REPOSITORY } from '../../../domain/repositories/trabajador.repository.interface';
import { UpdateContratoTrabajadorDto } from '../../dtos/trabajador/update-contrato-trabajador.dto';

@Injectable()
export class ActualizarContratoTrabajadorUseCase {
  constructor(
    @Inject(TRABAJADOR_REPOSITORY)
    private readonly trabajadorRepository: ITrabajadorRepository,
  ) {}

  async execute(
    idTrabajador: number,
    idContrato: number,
    dto: UpdateContratoTrabajadorDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.trabajadorRepository.actualizarContratoTrabajador({
      idContrato,
      idTrabajador,
      idUsuarioModificacion,
      idTipoContrato: dto.idTipoContrato,
      idDuracionContrato: dto.idDuracionContrato,
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      remuneracion: dto.remuneracion,
      fechaInicioLabores: dto.fechaInicioLabores,
      idPuestoTrabajo: dto.idPuestoTrabajo,
    });

    if (!resultado || !resultado.success) {
      throw new BadRequestException(
        resultado?.message || 'Error al actualizar el contrato',
      );
    }

    return { message: resultado.message };
  }
}
