import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import {
  InternalError,
  InvalidInputError,
} from '../../errors/application.error';
import { CreateNovedadTarjetaDto } from '../../inputs/novedad/create-novedad-tarjeta.dto';
import { NovedadTarjetaMediaStoragePort } from '../../ports/novedad-tarjeta-media-storage.port';
import type { UploadedFile } from '../../ports/uploaded-file';

export class CrearNovedadTarjetaUseCase {
  constructor(
    private readonly novedadRepository: INovedadRepository,
    private readonly novedadTarjetaMediaStorage: NovedadTarjetaMediaStoragePort,
  ) {}

  async execute(
    idNovedadLanzamiento: number,
    dto: CreateNovedadTarjetaDto,
    idUsuarioCreacion: number,
    file?: UploadedFile,
  ) {
    const sinMultimedia = dto.sinMultimedia === true;

    if (sinMultimedia) {
      const resultado = await this.novedadRepository.crearTarjeta({
        idNovedadLanzamiento,
        titulo: dto.titulo,
        descripcion: dto.descripcion ?? null,
        orden: dto.orden ?? 0,
        tipoMultimedia: '',
        idArchivo: null,
        urlMultimedia: null,
        idUsuarioCreacion,
      });

      if (!resultado || !resultado.success) {
        throw new InvalidInputError(
          resultado?.message || 'Error al crear la tarjeta',
        );
      }

      const idTarjeta =
        resultado.id_tarjeta ?? resultado.idTarjeta ?? resultado.id;

      return {
        message: resultado.message,
        id: idTarjeta,
      };
    }

    const tipo = (dto.tipoMultimedia ?? 'imagen').toLowerCase() as
      | 'imagen'
      | 'video';

    let idArchivo = dto.idArchivo ?? null;
    let urlMultimedia = dto.urlMultimedia?.trim() || null;

    if (tipo === 'imagen') {
      if (!file) {
        throw new InvalidInputError(
          'Debe subir un archivo de imagen para la tarjeta',
        );
      }
      urlMultimedia = null;
      idArchivo = await this.persistUploadedFile(
        idNovedadLanzamiento,
        'imagen',
        file,
        idUsuarioCreacion,
      );
    } else if (tipo === 'video') {
      if (file) {
        urlMultimedia = null;
        idArchivo = await this.persistUploadedFile(
          idNovedadLanzamiento,
          'video',
          file,
          idUsuarioCreacion,
        );
      } else if (!urlMultimedia && !idArchivo) {
        throw new InvalidInputError(
          'Para video debe subir un archivo o indicar una URL externa',
        );
      }
    }

    const resultado = await this.novedadRepository.crearTarjeta({
      idNovedadLanzamiento,
      titulo: dto.titulo,
      descripcion: dto.descripcion ?? null,
      orden: dto.orden ?? 0,
      tipoMultimedia: tipo,
      idArchivo,
      urlMultimedia,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al crear la tarjeta',
      );
    }

    const idTarjeta =
      resultado.id_tarjeta ?? resultado.idTarjeta ?? resultado.id;

    return {
      message: resultado.message,
      id: idTarjeta,
    };
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

      const idArchivo =
        registro.id_archivo ?? registro.idArchivo ?? registro.id;
      if (!idArchivo) {
        throw new InternalError('No se obtuvo el ID del archivo registrado');
      }
      return Number(idArchivo);
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
