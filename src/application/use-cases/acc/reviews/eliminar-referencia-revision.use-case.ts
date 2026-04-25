import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

@Injectable()
export class EliminarReferenciaRevisionUseCase {
  constructor(private readonly dbFunctionService: DatabaseFunctionService) {}

  async execute(
    idReferencia: number,
    userId: number,
  ): Promise<{ message: string }> {
    const rows = await this.dbFunctionService.callFunction<{
      success: boolean;
      message: string;
    }>('acc_EliminarReferenciaRevision', [idReferencia, userId]);

    const row = rows?.[0];
    if (!row?.success) {
      throw new NotFoundException(row?.message ?? 'Referencia no encontrada');
    }

    return { message: row.message };
  }
}
