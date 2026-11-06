import type {
  ActividadDetalle,
  IControlOperativoRepository,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { UnauthenticatedError } from '../../errors/application.error';

export interface ObtenerActividadInput {
  idActividad: number;
  /** Si true, solo devuelve la actividad si el usuario puede validarla (pestaña Validación). */
  contextoValidacion?: boolean;
  idUsuario?: number;
  /** `control_operativo.validacion.ver` con alcance «todos». */
  accesoTotalValidacion?: boolean;
}

export class ObtenerActividadUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  async execute(
    input: ObtenerActividadInput | number,
  ): Promise<ActividadDetalle | null> {
    const idActividad = typeof input === 'number' ? input : input.idActividad;
    const contextoValidacion =
      typeof input === 'object' && input.contextoValidacion === true;
    const idUsuario = typeof input === 'object' ? input.idUsuario : undefined;

    if (contextoValidacion) {
      if (idUsuario == null) {
        throw new UnauthenticatedError('Usuario no identificado');
      }
      const esAdminTotal =
        typeof input === 'object' && input.accesoTotalValidacion === true;
      const idRevisor =
        await this.controlOperativoRepository.obtenerIdTrabajadorPorIdUsuario(
          idUsuario,
        );
      if (idRevisor == null) {
        return null;
      }
      const puede = await this.controlOperativoRepository.puedeValidarActividad(
        idActividad,
        idRevisor,
        esAdminTotal,
      );
      if (!puede) {
        return null;
      }
    }

    return this.controlOperativoRepository.obtenerActividad(idActividad);
  }
}
