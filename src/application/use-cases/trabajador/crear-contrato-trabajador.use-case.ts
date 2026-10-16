import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { CreateContratoTrabajadorDto } from '../../inputs/trabajador/create-contrato-trabajador.dto';

export class CrearContratoTrabajadorUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  async execute(
    idTrabajador: number,
    dto: CreateContratoTrabajadorDto,
    idUsuarioCreacion: number,
  ) {
    const resultado =
      await this.trabajadorRepository.insertarContratoTrabajador({
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
      throw new InvalidInputError(
        resultado?.message || 'Error al registrar el contrato',
      );
    }

    return {
      message: resultado.message,
      idContrato: resultado.idcontrato ?? resultado.idContrato,
    };
  }
}
