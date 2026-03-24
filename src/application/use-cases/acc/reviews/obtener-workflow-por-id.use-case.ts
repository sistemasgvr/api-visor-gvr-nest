import { Injectable } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

type GvrWorkflowRow = {
    id: string;
    name: string;
    description: string | null;
    notes: string | null;
    status: string;
    steps_json: unknown;
    copy_files_enabled: boolean;
    copy_files_options_json: unknown;
    gvr_candidatos_json: unknown;
    created_at: string | Date;
    updated_at: string | Date;
    origen: string;
    allow_initiator_edit?: boolean;
    update_attributes_enabled?: boolean;
};

function mapGvrRowToWorkflow(row: GvrWorkflowRow): any {
    const steps = Array.isArray(row.steps_json) ? row.steps_json : [];
    const gvrCandidatos = Array.isArray(row.gvr_candidatos_json) ? row.gvr_candidatos_json : [];
    const copyJson = row.copy_files_options_json as Record<string, unknown> | null | undefined;
    const copyFilesOptions =
        copyJson && typeof copyJson === 'object' && copyJson !== null
            ? {
                  enabled: !!copyJson.enabled,
                  condition: typeof copyJson.condition === 'string' ? copyJson.condition : 'ANY',
                  ...(typeof copyJson.folderUrn === 'string' && copyJson.folderUrn
                      ? { folderUrn: copyJson.folderUrn }
                      : {}),
                  allowOverride: !!copyJson.allowOverride,
                  includeMarkups: copyJson.includeMarkups !== false,
                  allowApproversChangeMarkups: copyJson.allowApproversChangeMarkups !== false,
              }
            : { enabled: !!row.copy_files_enabled };

    return {
        id: row.id,
        name: row.name,
        description: row.description ?? undefined,
        notes: row.notes ?? undefined,
        status: row.status,
        steps,
        copyFilesOptions,
        createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
        updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
        gvrCandidatos,
        origen: row.origen ?? 'GVR',
        additionalOptions: {
            allowInitiatorToEdit: !!row.allow_initiator_edit,
        },
        updateAttributesOptions: {
            enableAttachedAttributes: !!row.update_attributes_enabled,
        },
    };
}

@Injectable()
export class ObtenerWorkflowPorIdUseCase {
    constructor(
        private readonly autodeskApiService: AutodeskApiService,
        private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
        private readonly dbFunctionService: DatabaseFunctionService,
    ) { }

    async execute(userId: number, projectId: string, workflowId: string): Promise<any> {
        const trimmed = workflowId?.trim() ?? '';
        if (/^\d+$/.test(trimmed)) {
            const flowId = parseInt(trimmed, 10);
            const rows = await this.dbFunctionService.callFunction<GvrWorkflowRow>(
                'acc_ObtenerFlujoTrabajoAprobacionGvrPorId',
                [projectId, flowId],
            );
            const row = rows?.[0];
            if (row) {
                return mapGvrRowToWorkflow(row);
            }
        }

        const accessToken = await this.obtenerTokenValidoHelper.execute(userId);
        return this.autodeskApiService.obtenerWorkflowPorId(accessToken, projectId, workflowId);
    }
}
