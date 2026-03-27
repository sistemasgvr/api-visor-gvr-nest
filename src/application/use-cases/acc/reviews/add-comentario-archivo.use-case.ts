import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';
import { AddComentarioArchivoDto } from '../../../dtos/acc/reviews/add-comentario-archivo.dto';

@Injectable()
export class AddComentarioArchivoUseCase {
    constructor(
        private readonly dbFunctionService: DatabaseFunctionService,
    ) { }

    async execute(
        userId: number,
        reviewId: number,
        fileId: number,
        dto: AddComentarioArchivoDto,
    ): Promise<{ id: number; message: string }> {
        const rows = await this.dbFunctionService.callFunction<{
            success: boolean;
            message: string;
            id_result: number;
        }>('acc_AddComentarioArchivoRevision', [reviewId, fileId, userId, dto.contenido]);

        const row = rows?.[0];
        if (!row?.success) {
            throw new BadRequestException(row?.message ?? 'Error al añadir el comentario');
        }
        return { id: row.id_result, message: row.message };
    }
}
