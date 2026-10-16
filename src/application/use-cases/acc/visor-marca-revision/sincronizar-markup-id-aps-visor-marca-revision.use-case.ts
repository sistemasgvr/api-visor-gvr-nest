import { type IAccVisorMarcaRevisionRepository } from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import type { SincronizarMarkupIdApsDto } from '../../../inputs/acc/visor-marca-revision/visor-marca-revision.dto';
import { assertOperacionMarcaRevision } from './visor-marca-revision.util';

export class SincronizarMarkupIdApsVisorMarcaRevisionUseCase {
  constructor(private readonly repository: IAccVisorMarcaRevisionRepository) {}

  async execute(id: number, dto: SincronizarMarkupIdApsDto, idUsuario: number) {
    const result = await this.repository.sincronizarMarkupIdAps(
      id,
      idUsuario,
      dto.markupIdAps,
    );
    assertOperacionMarcaRevision(result, 'sincronizar markupIdAps');
    const detalle = await this.repository.obtenerPorId(id, idUsuario);
    assertOperacionMarcaRevision(
      { success: detalle != null, message: 'Marca no encontrada' },
      'obtener la marca',
    );
    return detalle!;
  }
}
