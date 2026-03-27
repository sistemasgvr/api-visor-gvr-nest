import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';
import { AnularRevisionDto } from '../../../dtos/acc/reviews/anular-revision.dto';

@Injectable()
export class AnularRevisionEntireUseCase {
  constructor(
    private readonly dbFunctionService: DatabaseFunctionService,
  ) { }

  async execute(
    userId: number,
    projectId: string,
    reviewId: number,
    dto: AnularRevisionDto,
  ): Promise<{ id: number; message: string }> {
    const rows = await this.dbFunctionService.callFunction<{
      success: boolean;
      message: string;
      id_result: number;
    }>('acc_VoidEntireReview', [
      reviewId,
      projectId,
      userId,
      dto?.notas ?? null,
    ]);

    const row = rows?.[0];
    if (!row?.success) {
      throw new BadRequestException(row?.message ?? 'Error al anular la revisión');
    }

    return { id: row.id_result, message: row.message };
  }
}

