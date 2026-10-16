import { type IAccVisorMarcaRevisionRepository } from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';
import type { DuplicarVisorMarcaRevisionDto } from '../../../inputs/acc/visor-marca-revision/visor-marca-revision.dto';
import { VisorMarcaRevisionSyncService } from './visor-marca-revision-sync.service';
import { assertOperacionMarcaRevision } from './visor-marca-revision.util';

export class DuplicarVisorMarcaRevisionUseCase {
  constructor(
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
      throw new InvalidInputError('No se pudo duplicar la marca de revisión');
    }

    const detalle = await this.repository.obtenerPorId(result.id, idUsuario);
    if (!detalle) {
      throw new InvalidInputError(
        'Marca duplicada pero no visible para el usuario',
      );
    }
    this.syncService.emit('duplicated', detalle, idUsuario);
    return detalle;
  }
}
