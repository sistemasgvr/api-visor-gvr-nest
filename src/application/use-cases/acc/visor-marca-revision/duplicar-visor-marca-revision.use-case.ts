import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  ACC_VISOR_MARCA_REVISION_REPOSITORY,
  type IAccVisorMarcaRevisionRepository,
} from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import type { DuplicarVisorMarcaRevisionDto } from '../../../dtos/acc/visor-marca-revision/visor-marca-revision.dto';
import { assertOperacionMarcaRevision } from './visor-marca-revision.util';
import { VisorMarcaRevisionSyncService } from './visor-marca-revision-sync.service';

@Injectable()
export class DuplicarVisorMarcaRevisionUseCase {
  constructor(
    @Inject(ACC_VISOR_MARCA_REVISION_REPOSITORY)
    private readonly repository: IAccVisorMarcaRevisionRepository,
    private readonly syncService: VisorMarcaRevisionSyncService,
  ) {}

  async execute(
    idMarcaOrigen: number,
    dto: DuplicarVisorMarcaRevisionDto,
    idUsuario: number,
  ) {
    const result = await this.repository.duplicar({
      idMarcaOrigen,
      idUsuario,
      desplazamiento: dto.desplazamiento ?? null,
      titulo: dto.titulo ?? null,
    });

    if (!result.success) {
      assertOperacionMarcaRevision(result, 'duplicar la marca');
    }
    if (result.id == null) {
      throw new BadRequestException('No se pudo duplicar la marca de revisión');
    }

    const detalle = await this.repository.obtenerPorId(result.id, idUsuario);
    if (!detalle) {
      throw new BadRequestException('Marca duplicada pero no visible para el usuario');
    }
    this.syncService.emit('duplicated', detalle, idUsuario);
    return detalle;
  }
}
