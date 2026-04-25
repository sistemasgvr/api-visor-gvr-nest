import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';
import { VolverPasoAnteriorRevisionDto } from '../../../dtos/acc/reviews/volver-paso-anterior-revision.dto';

@Injectable()
export class VolverPasoAnteriorRevisionUseCase {
  constructor(private readonly dbFunctionService: DatabaseFunctionService) {}

  async execute(
    userId: number,
    projectId: string,
    reviewId: number,
    dto: VolverPasoAnteriorRevisionDto,
  ): Promise<{ id: number; message: string }> {
    const rows = await this.dbFunctionService.callFunction<{
      success: boolean;
      message: string;
      id_result: number;
    }>('acc_VolverPasoAnterior', [
      reviewId,
      projectId,
      userId,
      dto?.notas ?? null,
    ]);

    const row = rows?.[0];
    if (!row?.success) {
      throw new BadRequestException(
        row?.message ?? 'Error al volver al paso anterior',
      );
    }

    return { id: row.id_result, message: row.message };
  }
}
