import { Inject, Injectable } from '@nestjs/common';
import {
  ACC_VISOR_MARCA_REVISION_REPOSITORY,
  type IAccVisorMarcaRevisionRepository,
} from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import { assertOperacionMarcaRevision } from './visor-marca-revision.util';
import { VisorMarcaRevisionSyncService } from './visor-marca-revision-sync.service';

@Injectable()
export class AnularPublicacionVisorMarcaRevisionUseCase {
  constructor(
    @Inject(ACC_VISOR_MARCA_REVISION_REPOSITORY)
    private readonly repository: IAccVisorMarcaRevisionRepository,
    private readonly syncService: VisorMarcaRevisionSyncService,
  ) {}

  async execute(id: number, idUsuario: number) {
    const result = await this.repository.anularPublicacion(id, idUsuario);
    assertOperacionMarcaRevision(result, 'anular la publicación');
    const detalle = await this.repository.obtenerPorId(id, idUsuario);
    assertOperacionMarcaRevision(
      { success: detalle != null, message: 'Marca no encontrada' },
      'obtener la marca',
    );
    this.syncService.emit('unpublished', detalle!, idUsuario);
    return detalle!;
  }
}
