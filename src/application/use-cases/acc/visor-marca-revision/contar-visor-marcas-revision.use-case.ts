import { Inject, Injectable } from '@nestjs/common';
import {
  ACC_VISOR_MARCA_REVISION_REPOSITORY,
  type IAccVisorMarcaRevisionRepository,
} from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';

export interface ContarVisorMarcasRevisionQuery {
  documentUrn: string;
  viewableGuid?: string;
  paginaNumero?: number;
  versionId?: string;
}

@Injectable()
export class ContarVisorMarcasRevisionUseCase {
  constructor(
    @Inject(ACC_VISOR_MARCA_REVISION_REPOSITORY)
    private readonly repository: IAccVisorMarcaRevisionRepository,
  ) {}

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
