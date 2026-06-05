import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ACC_VISOR_ELEMENTO_FOTO_REPOSITORY,
  type IAccVisorElementoFotoRepository,
} from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';

@Injectable()
export class ObtenerVisorElementoFotoUseCase {
  constructor(
    @Inject(ACC_VISOR_ELEMENTO_FOTO_REPOSITORY)
    private readonly repository: IAccVisorElementoFotoRepository,
  ) {}

  async execute(id: number) {
    const data = await this.repository.obtenerPorId(id);
    if (!data) {
      throw new NotFoundException('Anclaje de fotos no encontrado');
    }
    return data;
  }
}
