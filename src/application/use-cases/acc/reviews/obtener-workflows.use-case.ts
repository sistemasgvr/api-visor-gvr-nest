import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import { ObtenerWorkflowsDto } from '../../../dtos/acc/reviews/obtener-workflows.dto';
import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

@Injectable()
export class ObtenerWorkflowsUseCase {
    constructor(
        private readonly autodeskApiService: AutodeskApiService,
        private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
        private readonly dbFunctionService: DatabaseFunctionService,
    ) { }

    async execute(userId: number, projectId: string, dto: ObtenerWorkflowsDto): Promise<any> {
        const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

        // Autodesk Workflows API max limit is 50. filter[status] and filter[name]
        // are NOT supported query params. We auto-paginate and filter client-side.
        const ACC_PAGE_SIZE = 50;
        const allWorkflows: any[] = [];
        let accOffset = 0;
        let firstError: any = null;

        while (true) {
            const pageFilters: Record<string, any> = { limit: ACC_PAGE_SIZE, offset: accOffset };
            if (dto.sort) pageFilters['sort'] = dto.sort;

            let pageResponse: any;
            try {
                pageResponse = await this.autodeskApiService.obtenerWorkflows(accessToken, projectId, pageFilters);
            } catch (err: any) {
                if (accOffset === 0) {
                    // First page failed — check for service errors and rethrow
                    const status = err?.statusCode ?? (err?.message?.includes('503') ? 503 : undefined);
                    if (status === 503 || status === 502 || status === 504) {
                        throw new ServiceUnavailableException(
                            'El servicio de Autodesk no está disponible temporalmente. Intente de nuevo en unos minutos.',
                        );
                    }
                    throw err;
                }
                firstError = err;
                break; // Stop gracefully on subsequent page errors
            }

            const pageItems: any[] =
                Array.isArray(pageResponse?.results) ? pageResponse.results :
                Array.isArray(pageResponse?.data)    ? pageResponse.data    :
                Array.isArray(pageResponse)          ? pageResponse         : [];

            allWorkflows.push(...pageItems);

            // Stop when we have received the last page
            if (pageItems.length < ACC_PAGE_SIZE) break;
            const totalFromAcc = pageResponse?.pagination?.totalResults ?? 0;
            if (totalFromAcc > 0 && allWorkflows.length >= totalFromAcc) break;
            accOffset += ACC_PAGE_SIZE;
        }

        if (allWorkflows.length === 0 && firstError) {
            throw firstError;
        }

        // ── Client-side filtering ──────────────────────────────────────────────
        let workflows = allWorkflows;
        if (dto.filter_status) {
            workflows = workflows.filter((wf) => wf.status === dto.filter_status);
        }
        if (dto.filter_name) {
            const q = dto.filter_name.toLowerCase();
            workflows = workflows.filter((wf) => wf.name?.toLowerCase().includes(q));
        }

        // ── Enriquecer con candidatos GVR ──────────────────────────────────────
        try {
            const gvrRows = await this.dbFunctionService.callFunction<{
                accworkflowid: string;
                idusuario: number;
                nombreusuario: string;
                correousuario: string;
                tipopaso: string;
                nombrepaso: string;
                ordenpaso: number;
                esopcional: boolean;
            }>('acc_ListarWorkflowCandidatosPorProyecto', [projectId]);

            const byWorkflow: Record<string, typeof gvrRows> = {};
            for (const row of gvrRows) {
                const wid = row.accworkflowid;
                if (!byWorkflow[wid]) byWorkflow[wid] = [];
                byWorkflow[wid].push(row);
            }

            for (const wf of workflows) {
                wf.gvrCandidatos = (byWorkflow[wf.id] ?? []).map((r) => ({
                    idUsuario:  r.idusuario,
                    nombre:     r.nombreusuario,
                    correo:     r.correousuario,
                    tipoPaso:   r.tipopaso,
                    nombrePaso: r.nombrepaso,
                    ordenPaso:  r.ordenpaso,
                    esOpcional: r.esopcional,
                }));
            }
        } catch {
            // Enrichment should not block the main response
        }

        // ── Ordenar más reciente primero ───────────────────────────────────────
        workflows.sort((a, b) => {
            const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tB - tA;
        });

        // ── Client-side pagination (to preserve table pagination in the UI) ────
        const totalFiltered = workflows.length;
        const pageLimit  = dto.limit  ?? totalFiltered;
        const pageOffset = dto.offset ?? 0;
        const paginatedWorkflows = workflows.slice(pageOffset, pageOffset + pageLimit);

        return {
            results: paginatedWorkflows,
            pagination: {
                limit:        pageLimit,
                offset:       pageOffset,
                totalResults: totalFiltered,
            },
        };
    }
}
