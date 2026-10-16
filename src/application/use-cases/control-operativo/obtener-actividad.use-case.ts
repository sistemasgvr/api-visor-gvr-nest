import type { IAuthRepository } from '../../../domain/repositories/auth.repository.interface';
import type {
  ActividadDetalle,
  IControlOperativoRepository,
} from '../../../domain/repositories/control-operativo.repository.interface';
import { UnauthenticatedError } from '../../errors/application.error';
import { esAccesoTotalValidacionActividades } from './validacion-acceso.util';

export interface ObtenerActividadInput {
  idActividad: number;
  /** Si true, solo devuelve la actividad si el usuario puede validarla (pestaña Validación). */
  contextoValidacion?: boolean;
  idUsuario?: number;
}

export class ObtenerActividadUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,

    private readonly authRepository: IAuthRepository,
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
      const perfil = await this.authRepository.obtenerPerfilUsuario(idUsuario);
      if (!perfil?.roles || !Array.isArray(perfil.roles)) {
        throw new UnauthenticatedError('Usuario no identificado');
      }
      const rolesIds = (perfil.roles as { id?: number }[])
        .map((r) => r?.id)
        .filter((id): id is number => id != null);
      const esAdminTotal = esAccesoTotalValidacionActividades(rolesIds);
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
