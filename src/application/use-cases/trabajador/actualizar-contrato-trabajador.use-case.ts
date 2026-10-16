import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { UpdateContratoTrabajadorDto } from '../../inputs/trabajador/update-contrato-trabajador.dto';

export class ActualizarContratoTrabajadorUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

  async execute(
    idTrabajador: number,
    idContrato: number,
    dto: UpdateContratoTrabajadorDto,
    idUsuarioModificacion: number,
  ) {
    const resultado =
      await this.trabajadorRepository.actualizarContratoTrabajador({
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
      throw new InvalidInputError(
        resultado?.message || 'Error al actualizar el contrato',
      );
    }

    return { message: resultado.message };
  }
}
