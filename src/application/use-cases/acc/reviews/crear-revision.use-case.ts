import { Injectable, Inject } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { CrearRevisionDto } from '../../../dtos/acc/reviews/crear-revision.dto';
import type { IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';
import { AUDITORIA_REPOSITORY } from '../../../../domain/repositories/auditoria.repository.interface';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

@Injectable()
export class CrearRevisionUseCase {
    constructor(
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
        const flowId = parseInt(String(dto.workflowId ?? '').trim(), 10);
        if (Number.isNaN(flowId) || flowId < 1) {
            throw new BadRequestException(
                'workflowId inválido. Debe ser un ID numérico de flujo interno GVR.',
            );
        }

        const linkedDocuments = (dto.linkedDocuments ?? [])
            .map((doc: any) => {
                const versionUrn = String(doc?.versionUrn ?? doc?.urn ?? '').trim();
                if (!versionUrn) return null;
                const itemUrn = String(doc?.itemUrn ?? doc?.itemId ?? '').trim();
                const payload: { versionUrn: string; itemUrn?: string } = { versionUrn };
                if (itemUrn) payload.itemUrn = itemUrn;
                return payload;
            })
            .filter((x): x is { versionUrn: string; itemUrn?: string } => x != null);

        const rows = await this.dbFunctionService.callFunction<{
            id_revision: number;
            review_id: string;
            workflow_id: string;
            project_id: string;
            name: string;
            status: string;
            message: string;
            created_at: string | Date;
            linked_documents_count: number;
        }>('acc_CrearRevisionInterna', [
            projectId,
            userId,
            flowId,
            dto.name,
            dto.description ?? null,
            JSON.stringify(linkedDocuments),
        ]);

        const row = rows?.[0];
        if (!row?.review_id) {
            throw new BadRequestException(row?.message ?? 'No se pudo crear la revisión interna.');
        }

        try {
            await this.auditoriaRepository.registrarAccion(
                userId,
                'REVISION_CREATE',
                'revision',
                row.review_id,
                `Revisión creada: ${dto.name.substring(0, 100)}`,
                null,
                {
                    reviewId: row.review_id,
                    projectId: row.project_id ?? projectId,
                    name: dto.name.substring(0, 100),
                    workflowId: row.workflow_id ?? String(flowId),
                    linkedDocumentsCount: row.linked_documents_count ?? linkedDocuments.length,
                },
                ipAddress ?? '',
                userAgent ?? '',
                {
                    projectId: row.project_id ?? projectId,
                    accReviewId: row.review_id,
                    workflowId: row.workflow_id ?? String(flowId),
                    linkedDocumentsCount: row.linked_documents_count ?? linkedDocuments.length,
                },
            );
        } catch {
            // El fallo de auditoría no debe bloquear la operación principal
        }

        return {
            id: row.review_id,
            internalId: row.id_revision,
            name: row.name ?? dto.name,
            projectId: row.project_id ?? projectId,
            workflowId: row.workflow_id ?? String(flowId),
            status: row.status ?? 'OPEN',
            linkedDocumentsCount: row.linked_documents_count ?? linkedDocuments.length,
            createdAt:
                row.created_at instanceof Date
                    ? row.created_at.toISOString()
                    : String(row.created_at),
            message: row.message ?? 'Revisión creada internamente.',
        };
    }
}
