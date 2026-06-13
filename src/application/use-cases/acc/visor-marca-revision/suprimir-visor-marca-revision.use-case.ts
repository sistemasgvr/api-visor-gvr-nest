import { Inject, Injectable } from '@nestjs/common';
import {
  ACC_VISOR_MARCA_REVISION_REPOSITORY,
  type IAccVisorMarcaRevisionRepository,
} from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import { assertOperacionMarcaRevision } from './visor-marca-revision.util';

@Injectable()
export class SuprimirVisorMarcaRevisionUseCase {
  constructor(
    @Inject(ACC_VISOR_MARCA_REVISION_REPOSITORY)
    private readonly repository: IAccVisorMarcaRevisionRepository,
  ) {}

  async execute(id: number, idUsuario: number): Promise<void> {
    const result = await this.repository.suprimir(id, idUsuario);
    assertOperacionMarcaRevision(result, 'suprimir la marca');
  }
}
