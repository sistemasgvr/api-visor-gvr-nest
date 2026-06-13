import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ACC_VISOR_MARCA_REVISION_REPOSITORY,
  type IAccVisorMarcaRevisionRepository,
} from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';

@Injectable()
export class ObtenerVisorMarcaRevisionUseCase {
  constructor(
    @Inject(ACC_VISOR_MARCA_REVISION_REPOSITORY)
    private readonly repository: IAccVisorMarcaRevisionRepository,
  ) {}

  async execute(id: number, idUsuario: number) {
    const data = await this.repository.obtenerPorId(id, idUsuario);
    if (!data) {
      throw new NotFoundException('Marca de revisión no encontrada o sin permiso');
    }
    return data;
  }
}
