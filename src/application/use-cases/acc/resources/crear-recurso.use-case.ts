import type { IAccResourcesRepository } from '../../../../domain/repositories/acc-resources.repository.interface';
import { normalizeExternalId } from '../../../../domain/utils/normalize-external-id.util';
import { InvalidInputError } from '../../../errors/application.error';
import { CrearRecursoDto } from '../../../inputs/acc/resources/crear-recurso.dto';

export class CrearRecursoUseCase {
  constructor(
    private readonly accResourcesRepository: IAccResourcesRepository,
  ) {}

  async execute(dto: CrearRecursoDto, idUsuarioCreacion: number) {
    // Normalizar el external_id (quitar prefijo "b." si existe)
    const normalizedExternalId = normalizeExternalId(dto.external_id);

    if (!normalizedExternalId) {
      throw new InvalidInputError('El external_id es obligatorio');
    }

    const resultado = await this.accResourcesRepository.crearRecurso({
      external_id: normalizedExternalId,
      resource_type: dto.resource_type,
      name: dto.name,
      parent_id: dto.parent_id,
      account_id: dto.account_id,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al crear el recurso',
      );
    }

    return {
      id: resultado.id,
      message: resultado.message,
    };
  }
}
