import type {
  IControlOperativoRepository,
  ListarValorizacionResult,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { ForbiddenError } from '../../errors/application.error';
import { type IdsPermitidos, incluido } from './alcance.util';

export interface ListarValorizacionInput {
  idUsuario: number;
  idProyecto: number;
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  /** Proyectos del alcance de `control_operativo.valorizacion.ver` (`null` = todos). */
  proyectosPermitidos: IdsPermitidos;
}

export class ListarValorizacionUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    input: ListarValorizacionInput,
  ): Promise<ListarValorizacionResult> {
    if (!incluido(input.idProyecto, input.proyectosPermitidos)) {
      throw new ForbiddenError(
        'No tienes permiso para ver la valorización de este proyecto',
      );
    }
    return this.controlOperativoRepository.listarValorizacion({
      idProyecto: input.idProyecto,
      fechaInicio: input.fechaInicio,
      fechaFin: input.fechaFin,
    });
  }
}
