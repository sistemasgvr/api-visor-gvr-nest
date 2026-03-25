import { Injectable } from '@nestjs/common';
import { ObtenerRevisionesDto } from '../../../dtos/acc/reviews/obtener-revisiones.dto';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

@Injectable()
export class ObtenerRevisionesUseCase {
    constructor(
        private readonly dbFunctionService: DatabaseFunctionService,
    ) { }

    async execute(userId: number, projectId: string, dto: ObtenerRevisionesDto): Promise<any> {
        void userId;

        const rows = await this.dbFunctionService.callFunction<{
            id_revision: number;
            review_id: string | null;
            workflow_id: string;
            workflow_name: string;
            round_number: number;
            status_name: string | null;
            name: string;
            id_usuario_iniciador: number;
            nombre_usuario_iniciador: string | null;
            correo_usuario_iniciador: string | null;
            foto_perfil_usuario_iniciador: string | null;
            initiated_by_workflow: string;
            next_action_by_workflow: string;
            current_step_number: number | null;
            current_step_due_date: string | Date | null;
            created_at: string | Date;
            updated_at: string | Date;
            finished_at: string | Date | null;
            files_total: number;
            files_approved: number;
            files_rejected: number;
            progress_percent: string | number;
            total_count: number;
        }>('acc_ListarRevisionesInternasGvr', [
            projectId,
            dto.limit ?? 10,
            dto.offset ?? 0,
            dto.filter_status ?? null,
            dto.filter_name ?? null,
            dto.filter_createdAt ?? null,
            dto.filter_finishedAt ?? null,
            dto.filter_currentStepDueDate ?? null,
        ]);

        const candidatesByFlowStep = new Map<string, any[]>();
        const distinctFlowIds = Array.from(new Set(rows.map((r) => String(r.workflow_id)).filter((x) => /^\d+$/.test(x))));
        for (const flowId of distinctFlowIds) {
            const candidates = await this.dbFunctionService.callFunction<{
                idusuario: number;
                nombreusuario: string;
                correousuario: string;
                tipopaso: string;
                nombrepaso: string;
                ordenpaso: number;
                esopcional: boolean;
            }>('acc_ListarCandidatosFlujoTrabajoGvr', [parseInt(flowId, 10)]);
            for (const c of candidates) {
                if (String(c.tipopaso).toUpperCase() === 'INITIATOR') continue;
                const key = `${flowId}:${c.ordenpaso}`;
                const arr = candidatesByFlowStep.get(key) ?? [];
                arr.push(c);
                candidatesByFlowStep.set(key, arr);
            }
        }

        const normalizeStatus = (raw: string | null | undefined): 'OPEN' | 'CLOSED' | 'VOID' | 'FAILED' => {
            const s = String(raw ?? '').toUpperCase();
            if (s === 'CLOSED' || s === 'CERRADO') return 'CLOSED';
            if (s === 'VOID' || s === 'VOIDED' || s === 'ANULADO' || s === 'CANCELLED' || s === 'CANCELADO') return 'VOID';
            if (s === 'FAILED' || s === 'FALLIDO') return 'FAILED';
            return 'OPEN';
        };

        let mapped = rows.map((r) => {
            const reviewId = (r.review_id && String(r.review_id).trim().length > 0)
                ? String(r.review_id)
                : `GVR-${r.id_revision}`;
            const workflowId = String(r.workflow_id ?? '');
            const currentStep = r.current_step_number ?? 0;
            const gvrNextActionBy = candidatesByFlowStep.get(`${workflowId}:${currentStep}`)?.map((c) => ({
                idUsuario: c.idusuario,
                nombre: c.nombreusuario,
                correo: c.correousuario,
                tipoPaso: c.tipopaso,
                nombrePaso: c.nombrepaso,
                ordenPaso: c.ordenpaso,
                esOpcional: c.esopcional,
            })) ?? [];

            return {
                id: reviewId,
                sequenceId: r.id_revision,
                round: r.round_number ?? 1,
                name: r.name,
                status: normalizeStatus(r.status_name),
                currentStepId: r.current_step_number != null ? String(r.current_step_number) : null,
                currentStepDueDate: r.current_step_due_date
                    ? (r.current_step_due_date instanceof Date
                        ? r.current_step_due_date.toISOString()
                        : String(r.current_step_due_date))
                    : null,
                workflowId,
                workflowName: r.workflow_name ?? '',
                initiatedByWorkflow: r.initiated_by_workflow ?? '',
                nextActionByWorkflow: r.next_action_by_workflow ?? '',
                createdBy: {
                    autodeskId: String(r.id_usuario_iniciador),
                    name: r.nombre_usuario_iniciador ?? 'Usuario',
                },
                createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
                updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
                finishedAt: r.finished_at
                    ? (r.finished_at instanceof Date ? r.finished_at.toISOString() : String(r.finished_at))
                    : null,
                archived: false,
                archivedBy: null,
                archivedAt: null,
                filesCount: r.files_total ?? 0,
                approvedCount: r.files_approved ?? 0,
                rejectedCount: r.files_rejected ?? 0,
                progressPercent: Number(r.progress_percent ?? 0),
                nextActionBy: {
                    claimedBy: [],
                    candidates: {
                        roles: [],
                        users: gvrNextActionBy.map((c) => ({ autodeskId: String(c.idUsuario), name: c.nombre })),
                        companies: [],
                    },
                },
                gvrCreadoPor: {
                    idUsuario: r.id_usuario_iniciador,
                    nombre: r.nombre_usuario_iniciador ?? 'Usuario',
                    correo: r.correo_usuario_iniciador ?? '',
                    fotoPerfil: r.foto_perfil_usuario_iniciador ?? null,
                },
                gvrNextActionBy,
            };
        });

        if (dto.filter_workflowId) mapped = mapped.filter((x) => x.workflowId === dto.filter_workflowId);
        if (dto.filter_sequenceId !== undefined) mapped = mapped.filter((x) => x.sequenceId === dto.filter_sequenceId);
        if (dto.filter_archived !== undefined) mapped = mapped.filter((x) => x.archived === dto.filter_archived);
        const totalResults = rows[0]?.total_count ?? 0;
        const limit = dto.limit ?? 10;
        const offset = dto.offset ?? 0;
        const results = mapped;

        return {
            results,
            pagination: {
                limit,
                offset,
                totalResults,
            },
        };
    }
}
