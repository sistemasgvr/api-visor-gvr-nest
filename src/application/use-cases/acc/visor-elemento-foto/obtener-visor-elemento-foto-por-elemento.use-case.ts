import { type IAccVisorElementoFotoRepository } from '../../../../domain/repositories/acc-visor-elemento-foto.repository.interface';

export class ObtenerVisorElementoFotoPorElementoUseCase {
  constructor(private readonly repository: IAccVisorElementoFotoRepository) {}

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
