import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  ACC_VISOR_MARCA_REVISION_REPOSITORY,
  type CrearVisorMarcaRevisionParams,
  type IAccVisorMarcaRevisionRepository,
} from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import type { CrearVisorMarcaRevisionDto } from '../../../dtos/acc/visor-marca-revision/visor-marca-revision.dto';

@Injectable()
export class CrearVisorMarcaRevisionUseCase {
  constructor(
    @Inject(ACC_VISOR_MARCA_REVISION_REPOSITORY)
    private readonly repository: IAccVisorMarcaRevisionRepository,
  ) {}

  async execute(
    idProyectoAcc: string,
    dto: CrearVisorMarcaRevisionDto,
    idUsuario: number,
  ) {
    const params: CrearVisorMarcaRevisionParams = {
      idProyectoAcc,
      documentUrn: dto.documentUrn,
      itemId: dto.itemId,
      tipoMarca: dto.tipoMarca,
      markupPayload: dto.markupPayload,
      idProyectoGvr: dto.idProyectoGvr ?? null,
      versionId: dto.versionId ?? null,
      nombreDocumento: dto.nombreDocumento ?? null,
      viewableGuid: dto.viewableGuid ?? null,
      viewableName: dto.viewableName ?? null,
      paginaNumero: dto.paginaNumero ?? null,
      is3D: dto.is3D ?? false,
      viewerState: dto.viewerState ?? null,
      idRevisionArchivo: dto.idRevisionArchivo ?? null,
      titulo: dto.titulo ?? null,
      markupIdAps: dto.markupIdAps ?? null,
      layerName: dto.layerName ?? null,
      estilos: dto.estilos ?? null,
      boundingBox: dto.boundingBox ?? null,
      miniaturaSvg: dto.miniaturaSvg ?? null,
      idUsuario,
    };

    const result = await this.repository.crear(params);
    if (!result.success) {
      throw new BadRequestException(result.message);
    }
    if (result.id == null) {
      throw new BadRequestException('No se pudo crear la marca de revisión');
    }
    const detalle = await this.repository.obtenerPorId(result.id, idUsuario);
    if (!detalle) {
      throw new BadRequestException('Marca creada pero no visible para el usuario');
    }
    return detalle;
  }
}
