import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';
import { AgregarReferenciaRevisionDto } from '../../../dtos/acc/reviews/agregar-referencia-revision.dto';

@Injectable()
export class AgregarReferenciaRevisionUseCase {
    constructor(
        private readonly dbFunctionService: DatabaseFunctionService,
    ) { }

    async execute(
        idRevision: number,
        projectId: string,
        dto: AgregarReferenciaRevisionDto,
        userId: number,
    ): Promise<{ id: number; message: string }> {
        const rows = await this.dbFunctionService.callFunction<{
            success: boolean;
            message: string;
            id_result: number;
        }>('acc_AgregarReferenciaRevision', [
            idRevision,
            projectId,
            dto.tipoReferencia,
            dto.idReferenciaExterna,
            dto.dominioReferencia ?? 'ACC',
            dto.versionReferencia ?? null,
            dto.notasReferencia ?? null,
            dto.urlDeepLink ?? null,
            dto.metadataJson ? JSON.stringify(dto.metadataJson) : null,
            userId,
        ]);

        const row = rows?.[0];
        if (!row?.success) {
            throw new BadRequestException(row?.message ?? 'Error al agregar referencia');
        }

        return { id: row.id_result, message: row.message };
    }
}
