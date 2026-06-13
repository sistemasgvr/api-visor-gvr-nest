import { Inject, Injectable } from '@nestjs/common';
import {
  ACC_VISOR_MARCA_REVISION_REPOSITORY,
  type IAccVisorMarcaRevisionRepository,
} from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import type { SincronizarMarkupIdApsDto } from '../../../dtos/acc/visor-marca-revision/visor-marca-revision.dto';
import { assertOperacionMarcaRevision } from './visor-marca-revision.util';

@Injectable()
export class SincronizarMarkupIdApsVisorMarcaRevisionUseCase {
  constructor(
    @Inject(ACC_VISOR_MARCA_REVISION_REPOSITORY)
    private readonly repository: IAccVisorMarcaRevisionRepository,
  ) {}

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
