import { UnauthenticatedError } from '../../../errors/application.error';
import type { AutodeskDataManagementPort } from '../../../ports/autodesk/data-management.port';

import { type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { ObtenerBucketsDto } from '../../../inputs/data-management/buckets/obtener-buckets.dto';

export class ObtenerBucketsUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskDataManagementPort,

    private readonly accRepository: IAccRepository,
  ) {}

  async execute(userId: number, dto: ObtenerBucketsDto): Promise<any> {
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

    return await this.autodeskApiService.obtenerBuckets(
      token.tokenAcceso,
      dto.region,
      dto.limit,
      dto.startAt,
    );
  }
}
