import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ACC_VISOR_ELEMENTO_FOTO_REPOSITORY,
  type IAccVisorElementoFotoRepository,
} from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';
import type { ActualizarVisorElementoFotoDto } from '../../../dtos/acc/visor-elemento-foto/visor-elemento-foto.dto';

@Injectable()
export class ActualizarVisorElementoFotoUseCase {
  constructor(
    @Inject(ACC_VISOR_ELEMENTO_FOTO_REPOSITORY)
    private readonly repository: IAccVisorElementoFotoRepository,
  ) {}

  async execute(
    id: number,
    dto: ActualizarVisorElementoFotoDto,
    idUsuario: number,
  ) {
    const existing = await this.repository.obtenerPorId(id);
    if (!existing) {
      throw new NotFoundException('Anclaje de fotos no encontrado');
    }
    try {
      await this.repository.actualizar({
        id,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        posicionX: dto.posicionX,
        posicionY: dto.posicionY,
        posicionZ: dto.posicionZ,
        nombreElemento: dto.nombreElemento,
        idUsuario,
      });
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'No se pudo actualizar',
      );
    }
    return this.repository.obtenerPorId(id);
  }
}
