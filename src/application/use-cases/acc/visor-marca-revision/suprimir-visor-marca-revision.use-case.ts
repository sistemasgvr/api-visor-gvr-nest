import { type IAccVisorMarcaRevisionRepository } from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import { VisorMarcaRevisionSyncService } from './visor-marca-revision-sync.service';
import { assertOperacionMarcaRevision } from './visor-marca-revision.util';

export class SuprimirVisorMarcaRevisionUseCase {
  constructor(
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
