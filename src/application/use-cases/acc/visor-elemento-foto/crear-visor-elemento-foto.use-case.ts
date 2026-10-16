import {
  type CrearVisorElementoFotoParams,
  type IAccVisorElementoFotoRepository,
} from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';
import {
  ConflictError,
  InvalidInputError,
} from '../../../errors/application.error';
import type { CrearVisorElementoFotoDto } from '../../../inputs/acc/visor-elemento-foto/visor-elemento-foto.dto';
import { normalizarArchivosVisorElementoFoto } from './visor-elemento-foto.util';

export class CrearVisorElementoFotoUseCase {
  constructor(private readonly repository: IAccVisorElementoFotoRepository) {}

  async execute(
    idProyectoAcc: string,
    dto: CrearVisorElementoFotoDto,
    idUsuario: number,
  ) {
    const archivos = normalizarArchivosVisorElementoFoto(dto.archivos);
    if (archivos.length === 0) {
      throw new InvalidInputError('Debe registrar al menos una imagen');
    }

    const params: CrearVisorElementoFotoParams = {
      idProyectoAcc,
      idProyectoGvr: dto.idProyectoGvr ?? null,
      documentUrn: dto.documentUrn,
      itemId: dto.itemId,
      versionId: dto.versionId ?? null,
      nombreDocumento: dto.nombreDocumento ?? null,
      objectId: dto.objectId,
      externalId: dto.externalId ?? null,
      nombreElemento: dto.nombreElemento ?? null,
      posicionX: dto.posicionX,
      posicionY: dto.posicionY,
      posicionZ: dto.posicionZ,
      viewableGuid: dto.viewableGuid ?? null,
      viewableName: dto.viewableName ?? null,
      is3D: dto.is3D ?? false,
      viewerState: dto.viewerState ?? null,
      titulo: dto.titulo ?? null,
      descripcion: dto.descripcion ?? null,
      archivos,
      idUsuario,
    };

    const result = await this.repository.crear(params);
    if (!result.success) {
      if (result.message.toLowerCase().includes('ya existe')) {
        throw new ConflictError(result.message);
      }
      throw new InvalidInputError(result.message);
    }
    if (result.id == null) {
      throw new InvalidInputError('No se pudo crear el anclaje de fotos');
    }
    return this.repository.obtenerPorId(result.id);
  }
}
