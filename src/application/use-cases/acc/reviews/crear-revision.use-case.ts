import { Injectable, Inject } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import { CrearRevisionDto } from '../../../dtos/acc/reviews/crear-revision.dto';
import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';
import type { IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';
import { AUDITORIA_REPOSITORY } from '../../../../domain/repositories/auditoria.repository.interface';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

@Injectable()
export class CrearRevisionUseCase {
    constructor(
        private readonly autodeskApiService: AutodeskApiService,
        private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
        private readonly dbFunctionService: DatabaseFunctionService,
        @Inject(AUDITORIA_REPOSITORY)
        private readonly auditoriaRepository: IAuditoriaRepository,
    ) { }

    async execute(
        userId: number,
        projectId: string,
        dto: CrearRevisionDto,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<any> {
        const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

        // Build the exact payload the ACC Reviews API expects.
        // The correct property is "fileVersions" (not "linkedDocuments"),
        // and each item must be { urn: "..." } — confirmed from official Postman collection.
        const bodyAutodesk: Record<string, any> = {
            name:       dto.name,
            workflowId: dto.workflowId,
        };
        if (dto.description) bodyAutodesk.notes = dto.description;
        if (dto.linkedDocuments?.length) {
            bodyAutodesk.fileVersions = dto.linkedDocuments.map((doc: any) => ({
                urn: doc.versionUrn ?? doc.urn,
            }));
        }
        const resultado = await this.autodeskApiService.crearRevision(accessToken, projectId, bodyAutodesk);

        const reviewId: string | null = resultado?.data?.id || resultado?.id || null;

        // Persist the GVR creator of this revision in our system
        if (reviewId) {
            try {
                await this.dbFunctionService.callFunction('accguardarrevision', [
                    reviewId,
                    projectId,
                    userId,
                    dto.workflowId ?? null,
                    dto.name?.substring(0, 500) ?? '',
                    userId,
                ]);
            } catch {
                // Saving the creator must not block the main operation
            }
        }

        try {
            await this.auditoriaRepository.registrarAccion(
                userId,
                'REVISION_CREATE',
                'revision',
                reviewId,
                `Revisión creada: ${dto.name.substring(0, 100)}`,
                null,
                {
                    reviewId,
                    projectId,
                    name: dto.name.substring(0, 100),
                    workflowId: dto.workflowId,
                    linkedDocumentsCount: dto.linkedDocuments?.length ?? 0,
                },
                ipAddress ?? '',
                userAgent ?? '',
                {
                    projectId,
                    accReviewId: reviewId,
                    workflowId: dto.workflowId,
                    linkedDocumentsCount: dto.linkedDocuments?.length ?? 0,
                },
            );
        } catch {
            // El fallo de auditoría no debe bloquear la operación principal
        }

        return resultado;
    }
}
