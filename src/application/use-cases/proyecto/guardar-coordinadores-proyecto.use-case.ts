import type {
  GuardarCoordinadoresProyectoPayload,
  IProyectoRepository,
} from '../../../domain/repositories/proyecto.repository.interface';
import type { GuardarCoordinadoresProyectoDto } from '../../inputs/proyecto/guardar-coordinadores-proyecto.dto';

export class GuardarCoordinadoresProyectoUseCase {
  constructor(private readonly proyectoRepository: IProyectoRepository) {}

  async execute(
    idProyecto: number,
    dto: GuardarCoordinadoresProyectoDto,
    idUsuario: number,
  ) {
    const payload: GuardarCoordinadoresProyectoPayload[] = (
      dto.coordinadores ?? []
    ).map((c) => ({
      idtrabajador: c.idtrabajador,
      miembrosEquipo: c.miembrosEquipo ?? [],
    }));
    return this.proyectoRepository.guardarCoordinadoresProyecto(
      idProyecto,
      payload,
      idUsuario,
    );
  }
}
