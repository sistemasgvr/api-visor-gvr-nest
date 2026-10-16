import type {
  IControlOperativoRepository,
  ObservacionActividad,
} from '../../../domain/repositories/control-operativo.repository.interface';

export class ListarObservacionesActividadUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(idActividad: number): Promise<ObservacionActividad[]> {
    return this.controlOperativoRepository.listarObservacionesActividad(
      idActividad,
    );
  }
}
