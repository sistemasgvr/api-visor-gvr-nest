import {
  InvalidInputError,
  UnauthenticatedError,
} from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { CrearBucketDto } from '../../../inputs/data-management/buckets/crear-bucket.dto';

export class CrearBucketUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,
  ) {}

  async execute(userId: number, dto: CrearBucketDto): Promise<any> {
    if (!dto.bucketKey) {
      throw new InvalidInputError('El bucket key es requerido');
    }

    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(userId);

    if (!token) {
      throw new UnauthenticatedError(
        'No se encontró token de acceso. Por favor, autoriza la aplicación primero.',
      );
    }

    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new UnauthenticatedError(
        'El token ha expirado. Por favor, refresca tu token.',
      );
    }

    return await this.autodeskApiService.crearBucket(
      token.tokenAcceso,
      dto.bucketKey,
      dto.policyKey || 'transient',
      dto.region,
    );
  }
}
