import type { ITrabajadorRepository } from '../../../domain/repositories/trabajador.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { UpdateTrabajadorDto } from '../../inputs/trabajador/update-trabajador.dto';

export class EditarTrabajadorUseCase {
  constructor(private readonly trabajadorRepository: ITrabajadorRepository) {}

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
      throw new InvalidInputError(
        resultado?.message || 'Error al editar el trabajador',
      );
    }

    if (adjuntos !== undefined) {
      await this.trabajadorRepository.eliminarAdjuntosPorTrabajador(
        idTrabajador,
      );
      if (adjuntos.length) {
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
    }

    return {
      message: resultado.message,
    };
  }
}
