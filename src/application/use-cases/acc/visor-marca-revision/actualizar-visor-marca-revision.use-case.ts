import { type IAccVisorMarcaRevisionRepository } from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import type { ActualizarVisorMarcaRevisionDto } from '../../../inputs/acc/visor-marca-revision/visor-marca-revision.dto';
import { VisorMarcaRevisionSyncService } from './visor-marca-revision-sync.service';
import { assertOperacionMarcaRevision } from './visor-marca-revision.util';

export class ActualizarVisorMarcaRevisionUseCase {
  constructor(
    private readonly repository: IAccVisorMarcaRevisionRepository,
    private readonly syncService: VisorMarcaRevisionSyncService,
  ) {}

  async execute(
    id: number,
    dto: ActualizarVisorMarcaRevisionDto,
    idUsuario: number,
  ) {
    const result = await this.repository.actualizar({
      id,
      idUsuario,
      titulo: dto.titulo ?? null,
      markupPayload: dto.markupPayload ?? null,
      markupIdAps: dto.markupIdAps ?? null,
      estilos: dto.estilos ?? null,
      boundingBox: dto.boundingBox ?? null,
      miniaturaSvg: dto.miniaturaSvg ?? null,
      viewerState: dto.viewerState ?? null,
      viewableGuid: dto.viewableGuid ?? null,
      viewableName: dto.viewableName ?? null,
      paginaNumero: dto.paginaNumero ?? null,
    });
    assertOperacionMarcaRevision(result, 'actualizar la marca');
    const detalle = await this.repository.obtenerPorId(id, idUsuario);
    assertOperacionMarcaRevision(
      { success: detalle != null, message: 'Marca no encontrada' },
      'obtener la marca',
    );
    this.syncService.emit('updated', detalle!, idUsuario);
    return detalle!;
  }
}
