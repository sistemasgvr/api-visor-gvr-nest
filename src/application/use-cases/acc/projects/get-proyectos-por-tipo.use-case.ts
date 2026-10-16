import { InvalidInputError } from '../../../errors/application.error';
import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { GetProyectosPorTipoDto } from '../../../inputs/acc/projects/get-proyectos-por-tipo.dto';

export class GetProyectosPorTipoUseCase {
  constructor(private readonly autodeskApiService: AutodeskAdminPort) {}

  async execute(accountId: string, dto: GetProyectosPorTipoDto): Promise<any> {
    // Filter empty tipos
    const tipos = dto.tipos.filter((tipo) => tipo && tipo.trim() !== '');

    if (tipos.length === 0) {
      throw new InvalidInputError(
        'Debe proporcionar al menos un tipo de proyecto válido',
      );
    }

    const options: Record<string, any> = {};

    if (dto.fields) {
      options.fields = dto.fields.split(',').map((f) => f.trim());
    }

    if (dto.filter_status) {
      options['filter[status]'] = dto.filter_status;
    }

    if (dto.sort) {
      options.sort = dto.sort;
    }

    options.limit = dto.limit || 20;
    options.offset = dto.offset || 0;

    // Set filter type with comma-separated tipos
    options['filter[type]'] = tipos.join(',');

    return await this.autodeskApiService.getAccProjects(
      accountId,
      options,
      dto.token,
    );
  }
}
