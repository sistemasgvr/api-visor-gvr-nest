import { Injectable } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import { ObtenerRevisionesDto } from '../../../dtos/acc/reviews/obtener-revisiones.dto';
import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

@Injectable()
export class ObtenerRevisionesUseCase {
    constructor(
        private readonly autodeskApiService: AutodeskApiService,
        private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
        private readonly dbFunctionService: DatabaseFunctionService,
    ) { }

    async execute(userId: number, projectId: string, dto: ObtenerRevisionesDto): Promise<any> {
        const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

        const filters: Record<string, any> = {};
        if (dto.limit !== undefined)                filters['limit'] = dto.limit;
        if (dto.offset !== undefined)               filters['offset'] = dto.offset;
        if (dto.sort)                               filters['sort'] = dto.sort;
        if (dto.filter_workflowId)                  filters['filter[workflowId]'] = dto.filter_workflowId;
        if (dto.filter_status)                      filters['filter[status]'] = dto.filter_status;
        if (dto.filter_currentStepDueDate)          filters['filter[currentStepDueDate]'] = dto.filter_currentStepDueDate;
        if (dto.filter_createdAt)                   filters['filter[createdAt]'] = dto.filter_createdAt;
        if (dto.filter_updatedAt)                   filters['filter[updatedAt]'] = dto.filter_updatedAt;
        if (dto.filter_finishedAt)                  filters['filter[finishedAt]'] = dto.filter_finishedAt;
        if (dto.filter_nextActionByUser)            filters['filter[nextActionByUser]'] = dto.filter_nextActionByUser;
        if (dto.filter_nextActionByRole)            filters['filter[nextActionByRole]'] = dto.filter_nextActionByRole;
        if (dto.filter_nextActionByCompany)         filters['filter[nextActionByCompany]'] = dto.filter_nextActionByCompany;
        if (dto.filter_name)                        filters['filter[name]'] = dto.filter_name;
        if (dto.filter_sequenceId !== undefined)    filters['filter[sequenceId]'] = dto.filter_sequenceId;
        if (dto.filter_archived !== undefined)      filters['filter[archived]'] = dto.filter_archived;
        if (dto.filter_archivedBy)                  filters['filter[archivedBy]'] = dto.filter_archivedBy;
        if (dto.filter_archivedAt)                  filters['filter[archivedAt]'] = dto.filter_archivedAt;

        const accResponse = await this.autodeskApiService.obtenerRevisiones(accessToken, projectId, filters);

        // ── Enriquecer con datos GVR ───────────────────────────────────────────
        try {
            // 1) Creadores GVR (quién creó cada revisión en nuestro sistema)
            const creadoresRows = await this.dbFunctionService.callFunction<{
                accreviewid:  string;
                accworkflowid: string | null;
                idusuario:    number;
                nombreusuario: string;
                correousuario: string;
                fotoperfil:   string | null;
                nombre:       string;
            }>('acc_ListarRevisionesPorProyecto', [projectId]);

            const byReview: Record<string, typeof creadoresRows[number]> = {};
            for (const row of creadoresRows) {
                byReview[row.accreviewid] = row;
            }

            // 2) Candidatos GVR de todos los workflows del proyecto
            //    (para "siguiente acción de")
            const candidatosRows = await this.dbFunctionService.callFunction<{
                accworkflowid: string;
                idusuario:    number;
                nombreusuario: string;
                correousuario: string;
                tipopaso:     string;
                nombrepaso:   string;
                ordenpaso:    number;
                esopcional:   boolean;
            }>('acc_ListarWorkflowCandidatosPorProyecto', [projectId]);

            // Group candidates by workflowId → step order → users
            const byWorkflowStep: Record<string, Record<number, typeof candidatosRows>> = {};
            for (const row of candidatosRows) {
                if (row.tipopaso === 'INITIATOR') continue; // Skip initiators
                if (!byWorkflowStep[row.accworkflowid]) byWorkflowStep[row.accworkflowid] = {};
                if (!byWorkflowStep[row.accworkflowid][row.ordenpaso]) byWorkflowStep[row.accworkflowid][row.ordenpaso] = [];
                byWorkflowStep[row.accworkflowid][row.ordenpaso].push(row);
            }

            // 3) Inject into each revision
            const revisiones: any[] =
                Array.isArray(accResponse?.results) ? accResponse.results :
                Array.isArray(accResponse?.data)    ? accResponse.data    :
                Array.isArray(accResponse)          ? accResponse         : [];

            for (const rev of revisiones) {
                // gvrCreadoPor — the GVR user who created this revision
                const creator = byReview[rev.id];
                rev.gvrCreadoPor = creator
                    ? {
                        idUsuario:    creator.idusuario,
                        nombre:       creator.nombreusuario,
                        correo:       creator.correousuario,
                        fotoPerfil:   creator.fotoperfil ?? null,
                    }
                    : null;

                // gvrNextActionBy — the GVR candidates for the next step(s) of the workflow
                const wfSteps = byWorkflowStep[rev.workflowId] ?? {};
                const stepOrders = Object.keys(wfSteps).map(Number).sort((a, b) => a - b);
                // Return candidates from all reviewer/approver steps (sorted by order)
                rev.gvrNextActionBy = stepOrders.flatMap((ord) =>
                    (wfSteps[ord] ?? []).map((c) => ({
                        idUsuario:  c.idusuario,
                        nombre:     c.nombreusuario,
                        correo:     c.correousuario,
                        tipoPaso:   c.tipopaso,
                        nombrePaso: c.nombrepaso,
                        ordenPaso:  c.ordenpaso,
                        esOpcional: c.esopcional,
                    }))
                );
            }
        } catch {
            // Enrichment must not block the main response
        }

        return accResponse;
    }
}
