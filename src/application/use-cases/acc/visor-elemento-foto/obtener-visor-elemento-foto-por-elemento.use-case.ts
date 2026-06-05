import { Inject, Injectable } from '@nestjs/common';
import {
  ACC_VISOR_ELEMENTO_FOTO_REPOSITORY,
  type IAccVisorElementoFotoRepository,
} from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';

@Injectable()
export class ObtenerVisorElementoFotoPorElementoUseCase {
  constructor(
    @Inject(ACC_VISOR_ELEMENTO_FOTO_REPOSITORY)
    private readonly repository: IAccVisorElementoFotoRepository,
  ) {}

  execute(
    idProyectoAcc: string,
    documentUrn: string,
    viewableGuid: string | null | undefined,
    objectId: number,
  ) {
    return this.repository.obtenerPorElemento(
      idProyectoAcc,
      documentUrn,
      viewableGuid,
      objectId,
    );
  }
}
