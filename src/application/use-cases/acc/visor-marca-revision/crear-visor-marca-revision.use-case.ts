import {
  type CrearVisorMarcaRevisionParams,
  type IAccVisorMarcaRevisionRepository,
} from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import { InvalidInputError } from '../../../errors/application.error';
import type { CrearVisorMarcaRevisionDto } from '../../../inputs/acc/visor-marca-revision/visor-marca-revision.dto';
import { VisorMarcaRevisionSyncService } from './visor-marca-revision-sync.service';

export class CrearVisorMarcaRevisionUseCase {
  constructor(
    private readonly repository: IAccVisorMarcaRevisionRepository,
    private readonly syncService: VisorMarcaRevisionSyncService,
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
      throw new InvalidInputError(result.message);
    }
    if (result.id == null) {
      throw new InvalidInputError('No se pudo crear la marca de revisión');
    }
    const detalle = await this.repository.obtenerPorId(result.id, idUsuario);
    if (!detalle) {
      throw new InvalidInputError(
        'Marca creada pero no visible para el usuario',
      );
    }
    this.syncService.emit('created', detalle, idUsuario);
    return detalle;
  }
}
