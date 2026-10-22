import { PlanificacionAccessService } from '../../services/planificacion-access.service';
import type { IProyectoRepository } from '../../../domain/repositories/proyecto.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { UpdateProyectoDto } from '../../inputs/proyecto/update-proyecto.dto';

export class EditarProyectoUseCase {
  constructor(
    private readonly proyectoRepository: IProyectoRepository,
    private readonly planificacion: PlanificacionAccessService,
  ) {}

  async execute(
    idProyecto: number,
    updateDto: UpdateProyectoDto,
    idUsuarioModificacion: number,
  ) {
    await this.planificacion.editarProyectoConPlan(
      idUsuarioModificacion,
      idProyecto,
    );

    // pro_EditarProyectoV2 reemplaza el calendario: si el formulario no lo envía se conserva; null lo quita.
    let idCalendario = updateDto.idCalendario;
    if (idCalendario === undefined) {
      const actual = (await this.proyectoRepository.obtenerProyectoPorId(
        idProyecto,
      )) as { idcalendario?: number | null } | null;
      idCalendario = actual?.idcalendario ?? null;
    }

    const resultado = await this.proyectoRepository.editarProyecto({
      idProyecto,
      ...updateDto,
      idCalendario,
      idUsuarioCreacion: idUsuarioModificacion, // Reuse for consistency
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al editar el proyecto',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
