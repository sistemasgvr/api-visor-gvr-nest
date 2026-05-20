import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';
import { UpdateNovedadTarjetaDto } from '../../dtos/novedad/update-novedad-tarjeta.dto';
import { NovedadTarjetaMediaStorageService } from '../../../infrastructure/services/novedad-tarjeta-media-storage.service';

@Injectable()
export class EditarNovedadTarjetaUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
    private readonly novedadTarjetaMediaStorage: NovedadTarjetaMediaStorageService,
  ) {}

  async execute(
    id: number,
    dto: UpdateNovedadTarjetaDto,
    idUsuarioModificacion: number,
    file?: Express.Multer.File,
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
        throw new BadRequestException(
          'Indique tipoMultimedia imagen o video al subir un archivo',
        );
      }
      const idLanzamiento =
        await this.novedadRepository.obtenerIdLanzamientoPorTarjeta(id);
      if (!idLanzamiento) {
        throw new BadRequestException(
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
      throw new BadRequestException(
        resultado?.message || 'Error al actualizar la tarjeta',
      );
    }

    return { message: resultado.message };
  }

  private async persistUploadedFile(
    idLanzamiento: number,
    tipo: 'imagen' | 'video',
    file: Express.Multer.File,
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
        throw new BadRequestException(
          registro?.message || 'No se pudo registrar el archivo',
        );
      }

      const idArchivoNuevo =
        registro.id_archivo ?? registro.idArchivo ?? registro.id;
      if (!idArchivoNuevo) {
        throw new InternalServerErrorException(
          'No se obtuvo el ID del archivo registrado',
        );
      }
      return Number(idArchivoNuevo);
    } catch (error) {
      await this.novedadTarjetaMediaStorage.deleteByStoredUrl(saved.url);
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'No se pudo registrar el archivo en la base de datos',
      );
    }
  }
}
