import { type IAccVisorMarcaRevisionRepository } from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';

export interface ContarVisorMarcasRevisionQuery {
  documentUrn: string;
  viewableGuid?: string;
  paginaNumero?: number;
  versionId?: string;
}

export class ContarVisorMarcasRevisionUseCase {
  constructor(private readonly repository: IAccVisorMarcaRevisionRepository) {}

  execute(
    idProyectoAcc: string,
    idUsuario: number,
    query: ContarVisorMarcasRevisionQuery,
  ) {
    return this.repository.contar({
      idProyectoAcc,
      documentUrn: query.documentUrn,
      idUsuario,
      viewableGuid: query.viewableGuid ?? null,
      paginaNumero: query.paginaNumero ?? null,
      versionId: query.versionId ?? null,
    });
  }
}
