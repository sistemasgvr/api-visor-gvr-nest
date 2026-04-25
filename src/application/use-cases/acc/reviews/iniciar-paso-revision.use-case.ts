import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

@Injectable()
export class IniciarPasoRevisionUseCase {
  constructor(private readonly dbFunctionService: DatabaseFunctionService) {}

  async execute(
    userId: number,
    projectId: string,
    reviewId: number,
  ): Promise<{ id: number; message: string }> {
    const rows = await this.dbFunctionService.callFunction<{
      success: boolean;
      message: string;
      id_result: number;
    }>('acc_IniciarPasoRevision', [reviewId, projectId, userId]);

    const row = rows?.[0];
    if (!row?.success) {
      throw new BadRequestException(row?.message ?? 'Error al iniciar el paso');
    }
    return { id: row.id_result, message: row.message };
  }
}
