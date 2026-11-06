import type {
  IControlOperativoRepository,
  ListarDesempenoResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { ForbiddenError } from '../../errors/application.error';
import { type IdsPermitidos, incluido } from './alcance.util';

export interface ListarDesempenoInput {
  idUsuario: number;
  idProyecto: number;
  fechaInicio: string;
  fechaFin: string;
  /** Opcional: filtrar por un solo trabajador. */
  idTrabajador?: number | null;
  /**
   * Alcance de `control_operativo.desempeno.ver`: proyectos y trabajadores permitidos
   * (`null` = todos). Con sólo «propios», `trabajadorPropio` fija el filtro en la propia persona.
   */
  proyectosPermitidos: IdsPermitidos;
  trabajadoresPermitidos: IdsPermitidos;
  trabajadorPropio?: number | null;
}

export class ListarDesempenoUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(input: ListarDesempenoInput): Promise<ListarDesempenoResult> {
    const idTrabajador = input.trabajadorPropio ?? input.idTrabajador ?? null;
    if (
      !incluido(input.idProyecto, input.proyectosPermitidos) ||
      (idTrabajador != null &&
        !incluido(idTrabajador, input.trabajadoresPermitidos))
    ) {
      throw new ForbiddenError('No tienes permiso para ver este desempeño');
    }
    return this.controlOperativoRepository.listarDesempeno({
      idProyecto: input.idProyecto,
      fechaInicio: input.fechaInicio,
      fechaFin: input.fechaFin,
      idTrabajador: idTrabajador ?? undefined,
    });
  }
}
