import { Inject, Injectable } from '@nestjs/common';
import {
  ACC_VISOR_MARCA_REVISION_REPOSITORY,
  type IAccVisorMarcaRevisionRepository,
} from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';

export interface ListarVisorMarcasRevisionQuery {
  documentUrn: string;
  viewableGuid?: string;
  paginaNumero?: number;
  versionId?: string;
  idRevisionArchivo?: number;
  soloPublicadas?: boolean;
  soloPropias?: boolean;
}

@Injectable()
export class ListarVisorMarcasRevisionUseCase {
  constructor(
    @Inject(ACC_VISOR_MARCA_REVISION_REPOSITORY)
    private readonly repository: IAccVisorMarcaRevisionRepository,
  ) {}

  execute(
    idProyectoAcc: string,
    idUsuario: number,
    query: ListarVisorMarcasRevisionQuery,
  ) {
    return this.repository.listar({
      idProyectoAcc,
      documentUrn: query.documentUrn,
      idUsuario,
      viewableGuid: query.viewableGuid ?? null,
      paginaNumero: query.paginaNumero ?? null,
      versionId: query.versionId ?? null,
      idRevisionArchivo: query.idRevisionArchivo ?? null,
      soloPublicadas: query.soloPublicadas ?? null,
      soloPropias: query.soloPropias ?? null,
    });
  }
}
