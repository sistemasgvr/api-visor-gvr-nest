import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { TRABAJADOR_REPOSITORY } from '../../../domain/repositories/trabajador.repository.interface';
import { CreateContratoTrabajadorDto } from '../../dtos/trabajador/create-contrato-trabajador.dto';

@Injectable()
export class CrearContratoTrabajadorUseCase {
  constructor(
    @Inject(TRABAJADOR_REPOSITORY)
    private readonly trabajadorRepository: ITrabajadorRepository,
  ) {}

  async execute(
    idTrabajador: number,
    dto: CreateContratoTrabajadorDto,
    idUsuarioCreacion: number,
  ) {
    const resultado = await this.trabajadorRepository.insertarContratoTrabajador({
      idTrabajador,
      idUsuarioCreacion,
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
        resultado?.message || 'Error al registrar el contrato',
      );
    }

    return {
      message: resultado.message,
      idContrato: resultado.idcontrato ?? resultado.idContrato,
    };
  }
}
