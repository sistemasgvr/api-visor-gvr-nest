import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';
import { SaltarPasoRevisionDto } from '../../../dtos/acc/reviews/saltar-paso-revision.dto';

@Injectable()
export class SaltarPasoRevisionUseCase {
    constructor(
        private readonly dbFunctionService: DatabaseFunctionService,
    ) { }

    async execute(
        userId: number,
        projectId: string,
        reviewId: number,
        dto: SaltarPasoRevisionDto,
    ): Promise<{ id: number; message: string }> {
        const rows = await this.dbFunctionService.callFunction<{
            success: boolean;
            message: string;
            id_result: number;
        }>('acc_SaltarPasoRevision', [
            reviewId,
            projectId,
            userId,
            dto?.notas ?? null,
        ]);

        const row = rows?.[0];
        if (!row?.success) {
            throw new BadRequestException(row?.message ?? 'Error al saltar el paso');
        }

        return { id: row.id_result, message: row.message };
    }
}
