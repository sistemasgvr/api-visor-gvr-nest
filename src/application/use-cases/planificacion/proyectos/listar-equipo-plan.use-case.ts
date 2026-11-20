import type { IPlanificacionRepository } from '../../../../domain/repositories/planificacion.repository.interface';
import type { ContextoPlan } from '../../../inputs/planificacion/proyectos/planificacion.input';
import { MinioStoragePort } from '../../../ports/minio-storage.port';
import { resolvePlanProfilePhotos } from '../../../helpers/resolve-plan-profile-photos.util';
export class ListarEquipoPlanUseCase {
  constructor(
    private readonly repository: IPlanificacionRepository,
    private readonly storage: MinioStoragePort,
  ) {}
  async execute(actor: number, ctx: ContextoPlan) {
    await this.repository.comprobarPertenencia(ctx);
    const equipo = await this.repository.listarEquipoPlan(actor, ctx.id);
    return resolvePlanProfilePhotos(equipo, this.storage);
  }
}
