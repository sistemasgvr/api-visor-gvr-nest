import { Injectable } from '@nestjs/common';
import { ObtenerWorkflowsDto } from '../../../dtos/acc/reviews/obtener-workflows.dto';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

/**
 * Lista flujos de trabajo de aprobación **solo desde la BD GVR**
 * (`acc_FlujoTrabajoAprobacion` vía `acc_ListarFlujosTrabajoAprobacionGvr`).
 * No consulta la API de Autodesk: la pantalla muestra únicamente lo persistido internamente.
 */
@Injectable()
export class ObtenerWorkflowsUseCase {
  constructor(private readonly dbFunctionService: DatabaseFunctionService) {}

  async execute(
    _userId: number,
    projectId: string,
    dto: ObtenerWorkflowsDto,
  ): Promise<any> {
    const gvrFlows = await this.dbFunctionService.callFunction<{
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
    }>('acc_ListarFlujosTrabajoAprobacionGvr', [projectId]);

    const workflows: any[] = [];
    for (const row of gvrFlows ?? []) {
      const steps = Array.isArray(row.steps_json) ? row.steps_json : [];
      const gvrCandidatos = Array.isArray(row.gvr_candidatos_json)
        ? row.gvr_candidatos_json
        : [];
      const copyJson = row.copy_files_options_json as
        | Record<string, unknown>
        | null
        | undefined;
      const copyFilesOptions =
        copyJson && typeof copyJson === 'object' && copyJson !== null
          ? {
              enabled: !!copyJson.enabled,
              condition:
                typeof copyJson.condition === 'string'
                  ? copyJson.condition
                  : 'ANY',
              ...(typeof copyJson.folderUrn === 'string' && copyJson.folderUrn
                ? { folderUrn: copyJson.folderUrn }
                : {}),
              allowOverride: !!copyJson.allowOverride,
              includeMarkups: copyJson.includeMarkups !== false,
              allowApproversChangeMarkups:
                copyJson.allowApproversChangeMarkups !== false,
            }
          : { enabled: !!row.copy_files_enabled };
      workflows.push({
        id: row.id,
        name: row.name,
        description: row.description ?? undefined,
        notes: row.notes ?? undefined,
        status: row.status,
        steps,
        copyFilesOptions,
        createdAt:
          row.created_at instanceof Date
            ? row.created_at.toISOString()
            : String(row.created_at),
        updatedAt:
          row.updated_at instanceof Date
            ? row.updated_at.toISOString()
            : String(row.updated_at),
        gvrCandidatos,
      });
    }

    let filtered = workflows;
    if (dto.filter_status) {
      filtered = filtered.filter((wf) => wf.status === dto.filter_status);
    }
    if (dto.filter_name) {
      const q = dto.filter_name.toLowerCase();
      filtered = filtered.filter((wf) => wf.name?.toLowerCase().includes(q));
    }

    filtered.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });

    const totalFiltered = filtered.length;
    const pageLimit = dto.limit ?? totalFiltered;
    const pageOffset = dto.offset ?? 0;
    const paginatedWorkflows = filtered.slice(
      pageOffset,
      pageOffset + pageLimit,
    );

    return {
      results: paginatedWorkflows,
      pagination: {
        limit: pageLimit,
        offset: pageOffset,
        totalResults: totalFiltered,
      },
    };
  }
}
