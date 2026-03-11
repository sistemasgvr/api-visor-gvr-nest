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

        const filters: Record<string, any> = {};
        if (dto.limit !== undefined)   filters['limit'] = dto.limit;
        if (dto.offset !== undefined)  filters['offset'] = dto.offset;
        if (dto.sort)                  filters['sort'] = dto.sort;
        if (dto.filter_status)         filters['filter[status]'] = dto.filter_status;
        if (dto.filter_name)           filters['filter[name]'] = dto.filter_name;

        let accResponse: any;
        try {
            accResponse = await this.autodeskApiService.obtenerWorkflows(accessToken, projectId, filters);
        } catch (err: any) {
            const status = err?.statusCode ?? (err?.message?.includes('503') ? 503 : undefined);
            if (status === 503 || status === 502 || status === 504) {
                throw new ServiceUnavailableException(
                    'El servicio de Autodesk no está disponible temporalmente. Intente de nuevo en unos minutos.',
                );
            }
            throw err;
        }

        // Enriquecer con candidatos GVR (un solo query para todos los workflows del proyecto)
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
            }>('acclistarworkflowcandidatosporproyecto', [projectId]);

            // Agrupar candidatos GVR por workflowId
            const byWorkflow: Record<string, typeof gvrRows> = {};
            for (const row of gvrRows) {
                const wid = row.accworkflowid;
                if (!byWorkflow[wid]) byWorkflow[wid] = [];
                byWorkflow[wid].push(row);
            }

            // Inyectar en cada workflow de la respuesta ACC
            const workflows: any[] =
                Array.isArray(accResponse?.results)   ? accResponse.results   :
                Array.isArray(accResponse?.data)       ? accResponse.data      :
                Array.isArray(accResponse)             ? accResponse           : [];

            for (const wf of workflows) {
                wf.gvrCandidatos = (byWorkflow[wf.id] ?? []).map((r) => ({
                    idUsuario:    r.idusuario,
                    nombre:       r.nombreusuario,
                    correo:       r.correousuario,
                    tipoPaso:     r.tipopaso,
                    nombrePaso:   r.nombrepaso,
                    ordenPaso:    r.ordenpaso,
                    esOpcional:   r.esopcional,
                }));
            }

            // Ordenar del más reciente al más antiguo (por createdAt)
            workflows.sort((a, b) => {
                const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return tB - tA;
            });
        } catch {
            // El enriquecimiento GVR no debe bloquear la respuesta principal
        }

        return accResponse;
    }
}
