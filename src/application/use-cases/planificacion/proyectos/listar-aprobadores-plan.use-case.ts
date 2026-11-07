import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type { ContextoPlan } from '../../../inputs/planificacion/proyectos/planificacion.input';
import { PERMISO_APROBAR_AMPLIACIONES } from './aprobadores-plan';
import { MinioStoragePort } from '../../../ports/minio-storage.port';
import { resolvePlanProfilePhotos } from '../../../helpers/resolve-plan-profile-photos.util';
export class ListarAprobadoresPlanUseCase {
  constructor(
    private readonly repository: IPlanificacionRepository,
    private readonly storage: MinioStoragePort,
  ) {}
  async execute(actor: number, ctx: ContextoPlan) {
    await this.repository.comprobarPertenencia(ctx);
    const aprobadores = await this.repository.listarAprobadoresPlan(
      actor,
      ctx.id,
      PERMISO_APROBAR_AMPLIACIONES,
    );
    return resolvePlanProfilePhotos(aprobadores, this.storage);
  }
}
