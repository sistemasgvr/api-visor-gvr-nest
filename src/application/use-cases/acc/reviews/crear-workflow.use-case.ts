import { Injectable, Inject } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import { CrearWorkflowDto } from '../../../dtos/acc/reviews/crear-workflow.dto';
import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';
import type { IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';
import { AUDITORIA_REPOSITORY } from '../../../../domain/repositories/auditoria.repository.interface';

@Injectable()
export class CrearWorkflowUseCase {
    constructor(
        private readonly autodeskApiService: AutodeskApiService,
        private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
        @Inject(AUDITORIA_REPOSITORY)
        private readonly auditoriaRepository: IAuditoriaRepository,
    ) { }

    async execute(
        userId: number,
        projectId: string,
        dto: CrearWorkflowDto,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<any> {
        const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

        // Para ACC: siempre el usuario autenticado como candidato en cada paso
        // Los candidatos GVR personalizados se guardan por separado en accWorkflowCandidato
        let autodeskUserId: string | null = null;
        try {
            const perfil = await this.autodeskApiService.obtenerPerfilUsuarioAcc(accessToken);
            autodeskUserId = perfil?.userId ?? null;
        } catch {
            // Si falla, el candidato quedará vacío (usuarios del proyecto podrán reclamar el paso)
        }

        const accCandidates = {
            users:     autodeskUserId ? [{ autodeskId: autodeskUserId }] : [],
            roles:     [] as any[],
            companies: [] as any[],
        };

        const rawSteps: any[] = dto.steps ?? [];
        const cleanedSteps = rawSteps.map((s: any) => {
            const step: Record<string, any> = {
                name: s.name,
                type: s.type,
                candidates: { ...accCandidates },
            };

            if (s.type !== 'INITIATOR') {
                step.duration    = s.duration    ?? 3;
                step.dueDateType = s.dueDateType ?? 'CALENDAR_DAY';
                // groupReview solo para REVIEWER (APPROVER no lo soporta)
                if (s.type === 'REVIEWER') {
                    const gr = s.groupReview;
                    step.groupReview = {
                        enabled: gr?.enabled ?? false,
                        type:    gr?.type    ?? 'MINIMUM',
                        ...(gr?.enabled && gr?.min != null ? { min: gr.min } : {}),
                    };
                }
            }

            return step;
        });

        // Limpiar copyFilesOptions: eliminar propiedades null/undefined que rechazan la API
        const rawCopyFiles = dto.copyFilesOptions ?? { enabled: false };
        const copyFilesOptions: Record<string, any> = {};
        for (const [k, v] of Object.entries(rawCopyFiles)) {
            if (v !== null && v !== undefined) copyFilesOptions[k] = v;
        }
        if (Object.keys(copyFilesOptions).length === 0) copyFilesOptions.enabled = false;

        const bodyAutodesk: Record<string, any> = {
            name:  dto.name,
            steps: cleanedSteps,
            additionalOptions: dto.additionalOptions ?? { allowInitiatorToEdit: false },
            copyFilesOptions,
        };
        if (dto.description) bodyAutodesk.description = dto.description;
        if (dto.notes)       bodyAutodesk.notes = dto.notes;
        if ((dto.additionalApprovalStatusOptions as any[])?.length) {
            bodyAutodesk.additionalApprovalStatusOptions = dto.additionalApprovalStatusOptions;
        }

        console.log('[CrearWorkflow] Body → Autodesk:', JSON.stringify(bodyAutodesk, null, 2));

        const resultado = await this.autodeskApiService.crearWorkflow(accessToken, projectId, bodyAutodesk);

        try {
            const workflowId = resultado?.data?.id || resultado?.id || null;
            await this.auditoriaRepository.registrarAccion(
                userId,
                'WORKFLOW_CREATE',
                'workflow',
                workflowId ? String(workflowId) : null,
                `Flujo de trabajo creado: ${dto.name.substring(0, 100)}`,
                null,
                {
                    workflowId,
                    projectId,
                    name: dto.name.substring(0, 100),
                    steps: (dto.steps ?? []).map((s: any) => ({
                        name: s.name,
                        type: s.type,
                    })),
                },
                ipAddress || '',
                userAgent || '',
                {
                    projectId,
                    accWorkflowId: workflowId,
                    stepsCount: (dto.steps ?? []).length,
                },
            );
        } catch {
            // Audit failure must not block the main operation
        }

        return resultado;
    }
}
