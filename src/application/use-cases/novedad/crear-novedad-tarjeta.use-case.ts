import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { INovedadRepository } from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';
import { CreateNovedadTarjetaDto } from '../../dtos/novedad/create-novedad-tarjeta.dto';
import { NovedadTarjetaMediaStorageService } from '../../../infrastructure/services/novedad-tarjeta-media-storage.service';

@Injectable()
export class CrearNovedadTarjetaUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
    private readonly novedadTarjetaMediaStorage: NovedadTarjetaMediaStorageService,
  ) {}

  async execute(
    idNovedadLanzamiento: number,
    dto: CreateNovedadTarjetaDto,
    idUsuarioCreacion: number,
    file?: Express.Multer.File,
  ) {
    const tipo = (dto.tipoMultimedia ?? 'imagen').toLowerCase() as
      | 'imagen'
      | 'video';

    let idArchivo = dto.idArchivo ?? null;
    let urlMultimedia = dto.urlMultimedia?.trim() || null;

    if (tipo === 'imagen') {
      if (!file) {
        throw new BadRequestException(
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
        throw new BadRequestException(
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
      throw new BadRequestException(
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

      const idArchivo =
        registro.id_archivo ?? registro.idArchivo ?? registro.id;
      if (!idArchivo) {
        throw new InternalServerErrorException(
          'No se obtuvo el ID del archivo registrado',
        );
      }
      return Number(idArchivo);
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
