import { Inject, Injectable } from '@nestjs/common';
import {
  ACC_VISOR_MARCA_REVISION_REPOSITORY,
  type IAccVisorMarcaRevisionRepository,
} from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import { assertOperacionMarcaRevision } from './visor-marca-revision.util';
import { VisorMarcaRevisionSyncService } from './visor-marca-revision-sync.service';

@Injectable()
export class SuprimirVisorMarcaRevisionUseCase {
  constructor(
    @Inject(ACC_VISOR_MARCA_REVISION_REPOSITORY)
    private readonly repository: IAccVisorMarcaRevisionRepository,
    private readonly syncService: VisorMarcaRevisionSyncService,
  ) {}

  async execute(id: number, idUsuario: number): Promise<void> {
    const snapshot = await this.repository.obtenerPorId(id, idUsuario);
    const result = await this.repository.suprimir(id, idUsuario);
    assertOperacionMarcaRevision(result, 'suprimir la marca');
    if (snapshot) {
      this.syncService.emitDeleted(snapshot, idUsuario);
    }
  }
}
