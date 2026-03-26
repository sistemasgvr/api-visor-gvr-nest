import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';
import { EnviarResenaPasoDto } from '../../../dtos/acc/reviews/enviar-resena-paso.dto';

@Injectable()
export class EnviarResenaPasoUseCase {
    constructor(
        private readonly dbFunctionService: DatabaseFunctionService,
    ) { }

    async execute(
        userId: number,
        projectId: string,
        reviewId: number,
        dto: EnviarResenaPasoDto,
    ): Promise<{ id: number; message: string }> {
        const docStatuses = dto?.docStatuses?.length
            ? JSON.stringify(dto.docStatuses.map(d => ({ idArchivo: d.idArchivo, estado: d.estado })))
            : '[]';

        const rows = await this.dbFunctionService.callFunction<{
            success: boolean;
            message: string;
            id_result: number;
        }>('acc_EnviarResenaPaso', [
            reviewId,
            projectId,
            userId,
            dto?.notas ?? null,
            docStatuses,
        ]);

        const row = rows?.[0];
        if (!row?.success) {
            throw new BadRequestException(row?.message ?? 'Error al enviar la reseña');
        }
        return { id: row.id_result, message: row.message };
    }
}
