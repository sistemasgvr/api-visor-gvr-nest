import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import {
  InternalError,
  InvalidInputError,
} from '../../errors/application.error';
import { UpdateNovedadTarjetaDto } from '../../inputs/novedad/update-novedad-tarjeta.dto';
import { NovedadTarjetaMediaStoragePort } from '../../ports/novedad-tarjeta-media-storage.port';
import type { UploadedFile } from '../../ports/uploaded-file';

export class EditarNovedadTarjetaUseCase {
  constructor(
    private readonly novedadRepository: INovedadRepository,
    private readonly novedadTarjetaMediaStorage: NovedadTarjetaMediaStoragePort,
  ) {}

  async execute(
    id: number,
    dto: UpdateNovedadTarjetaDto,
    idUsuarioModificacion: number,
    file?: UploadedFile,
  ) {
    const tipo = dto.tipoMultimedia?.toLowerCase() as
      | 'imagen'
      | 'video'
      | undefined;

    let idArchivo: number | null | undefined = dto.idArchivo ?? undefined;
    let urlMultimedia: string | null | undefined = undefined;
    if (dto.urlMultimedia !== undefined) {
      const trimmed = dto.urlMultimedia.trim();
      urlMultimedia = trimmed === '' ? '' : trimmed;
    }

    const limpiarMultimedia =
      dto.limpiarMultimedia === true ||
      dto.sinMultimedia === true ||
      (dto.tipoMultimedia !== undefined && dto.tipoMultimedia.trim() === '');

    if (limpiarMultimedia) {
      idArchivo = null;
      urlMultimedia = '';
    }

    if (file) {
      if (!tipo || (tipo !== 'imagen' && tipo !== 'video')) {
        throw new InvalidInputError(
          'Indique tipoMultimedia imagen o video al subir un archivo',
        );
      }
      const idLanzamiento =
        await this.novedadRepository.obtenerIdLanzamientoPorTarjeta(id);
      if (!idLanzamiento) {
        throw new InvalidInputError(
          'La tarjeta no existe o no se pudo determinar su lanzamiento',
        );
      }
      urlMultimedia = '';
      idArchivo = await this.persistUploadedFile(
        idLanzamiento,
        tipo,
        file,
        idUsuarioModificacion,
      );
    }

    const urlArchivoAnterior =
      await this.novedadRepository.obtenerArchivoUrlPorTarjeta(id);

    const debeBorrarArchivoStorage =
      !!urlArchivoAnterior &&
      (limpiarMultimedia ||
        !!file ||
        (urlMultimedia !== undefined && urlMultimedia.length > 0));

    const resultado = await this.novedadRepository.editarTarjeta({
      id,
      titulo: dto.titulo,
      descripcion: dto.descripcion ?? null,
      orden: dto.orden ?? null,
      tipoMultimedia: limpiarMultimedia ? null : (dto.tipoMultimedia ?? null),
      idArchivo,
      urlMultimedia,
      limpiarMultimedia,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al actualizar la tarjeta',
      );
    }

    if (debeBorrarArchivoStorage && urlArchivoAnterior) {
      await this.novedadTarjetaMediaStorage.deleteByStoredUrl(
        urlArchivoAnterior,
      );
    }

    return { message: resultado.message };
  }

  private async persistUploadedFile(
    idLanzamiento: number,
    tipo: 'imagen' | 'video',
    file: UploadedFile,
    idUsuario: number,
  ): Promise<number> {
    const saved = await this.novedadTarjetaMediaStorage.save(
      idLanzamiento,
      tipo,
      file,
    );

    try {
      const registro = await this.novedadRepository.registrarArchivo({
        url: saved.url,
        nombreOriginal: saved.nombreOriginal,
        tipoMime: saved.tipoMime,
        tamanoBytes: saved.tamanoBytes,
        idUsuarioCreacion: idUsuario,
      });

      if (!registro?.success) {
        throw new InvalidInputError(
          registro?.message || 'No se pudo registrar el archivo',
        );
      }

      const idArchivoNuevo =
        registro.id_archivo ?? registro.idArchivo ?? registro.id;
      if (!idArchivoNuevo) {
        throw new InternalError('No se obtuvo el ID del archivo registrado');
      }
      return Number(idArchivoNuevo);
    } catch (error) {
      await this.novedadTarjetaMediaStorage.deleteByStoredUrl(saved.url);
      if (
        error instanceof InvalidInputError ||
        error instanceof InternalError
      ) {
        throw error;
      }
      throw new InternalError(
        'No se pudo registrar el archivo en la base de datos',
      );
    }
  }
}
