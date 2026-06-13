import { Inject, Injectable } from '@nestjs/common';
import {
  ACC_VISOR_MARCA_REVISION_REPOSITORY,
  type IAccVisorMarcaRevisionRepository,
} from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import type { ActualizarVisorMarcaRevisionDto } from '../../../dtos/acc/visor-marca-revision/visor-marca-revision.dto';
import { assertOperacionMarcaRevision } from './visor-marca-revision.util';

@Injectable()
export class ActualizarVisorMarcaRevisionUseCase {
  constructor(
    @Inject(ACC_VISOR_MARCA_REVISION_REPOSITORY)
    private readonly repository: IAccVisorMarcaRevisionRepository,
  ) {}

  async execute(id: number, dto: ActualizarVisorMarcaRevisionDto, idUsuario: number) {
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
    return detalle!;
  }
}
