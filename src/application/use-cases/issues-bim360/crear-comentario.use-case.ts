import type { AutodeskBim360Port } from '../../ports/autodesk/bim360.port';

import { CrearComentarioDto } from '../../inputs/issues-bim360/crear-comentario.dto';
import ObtenerTokenValidoHelper from '../acc/issues/obtener-token-valido.helper';

export class CrearComentarioBim360UseCase {
  constructor(
    private readonly autodeskApiService: AutodeskBim360Port,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    issueId: string,
    dto: CrearComentarioDto,
  ): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

    const data = {
      body: dto.body,
    };

    return await this.autodeskApiService.crearComentarioBim360(
      accessToken,
      projectId,
      issueId,
      data,
    );
  }
}
