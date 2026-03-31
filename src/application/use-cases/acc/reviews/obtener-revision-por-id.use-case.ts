import { Injectable, BadRequestException } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import ObtenerTokenValidoHelper from '../issues/obtener-token-valido.helper';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

@Injectable()
export class ObtenerRevisionPorIdUseCase {
    constructor(
        private readonly autodeskApiService: AutodeskApiService,
        private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
        private readonly dbFunctionService: DatabaseFunctionService,
    ) { }

    async execute(userId: number, projectId: string, reviewId: string): Promise<any> {
        const internal = await this.dbFunctionService.callFunction<{
            review_id: string;
            sequence_id: number;
            round_number: number;
            status_name: string;
            name: string;
            notes: string | null;
            workflow_id: string;
            workflow_name: string;
            workflow_notes: string | null;
            created_at: string | Date;
            updated_at: string | Date;
            finished_at: string | Date | null;
            current_step_number: number | null;
            current_step_due_date: string | Date | null;
            created_by_json: any;
            steps_json: any;
            candidates_current_json: any;
            files_json: any;
            activity_json: any;
            files_total: number;
            files_approved: number;
            files_rejected: number;
            progress_percent: number;
        }>('acc_ObtenerRevisionInternaGvrPorId', [projectId, reviewId]);

        const row = internal?.[0];
        if (row) {
            let rawFiles: any[] = Array.isArray(row.files_json) ? row.files_json : [];
            const fileIds = rawFiles.map((f) => Number(f.id)).filter((id) => Number.isFinite(id) && id > 0);
            if (fileIds.length > 0) {
                try {
                    const versionRows = await this.dbFunctionService.executeQuery<{ id: number; urnversionacc: string }>(
                        `SELECT id, urnversionacc FROM "acc_RevisionArchivo" WHERE id = ANY($1::int[]) AND estado = 1`,
                        [fileIds],
                    );
                    const vmap = new Map(versionRows.map((r) => [Number(r.id), String(r.urnversionacc ?? '').trim()]));
                    rawFiles = rawFiles.map((f) => {
                        const vu = String(f.versionUrn ?? '').trim() || vmap.get(Number(f.id)) || '';
                        return vu ? { ...f, versionUrn: vu } : f;
                    });
                } catch {
                    /* usar solo JSON de la función */
                }
            }

            const needsItemFromVersion = (f: any) =>
                !String(f.urnItemAcc ?? '').trim() && String(f.versionUrn ?? '').trim().length > 0;
            const needsNameFromUrn = (f: any) => String(f.name ?? '').startsWith('urn:');
            const needsAnyAccEnrich = rawFiles.some((f) => needsItemFromVersion(f) || needsNameFromUrn(f));

            let enrichedFiles = rawFiles;

            if (needsAnyAccEnrich) {
                try {
                    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

                    enrichedFiles = await Promise.all(
                        rawFiles.map(async (f) => {
                            let next = { ...f };
                            const versionUrn = String(f.versionUrn ?? '').trim();

                            if (needsItemFromVersion(f) && versionUrn) {
                                try {
                                    const versionResp = await this.autodeskApiService.obtenerVersionPorId(
                                        accessToken,
                                        projectId,
                                        versionUrn,
                                    );
                                    const itemId = versionResp?.data?.relationships?.item?.data?.id;
                                    if (itemId) {
                                        const itemStr = String(itemId);
                                        next = { ...next, urnItemAcc: itemStr };
                                        this.dbFunctionService.executeQuery(
                                            `UPDATE "acc_RevisionArchivo"
                                             SET urnitemacc = $1,
                                                 fechamodificacion = NOW()
                                             WHERE id = $2
                                               AND (urnitemacc IS NULL OR TRIM(COALESCE(urnitemacc, '')) = '')`,
                                            [itemStr, Number(f.id)],
                                        ).catch(() => { /* no bloquear */ });
                                    }
                                } catch {
                                    /* mantener fila sin item */
                                }
                            }

                            const rawName = String(next.name ?? '');
                            if (rawName.startsWith('urn:')) {
                                try {
                                    const versionResp = await this.autodeskApiService.obtenerVersionPorId(
                                        accessToken,
                                        projectId,
                                        rawName,
                                    );
                                    const attrs = versionResp?.data?.attributes ?? {};
                                    const displayName: string = attrs.displayName ?? attrs.name ?? rawName;
                                    const versionNum: number | null = attrs.versionNumber ?? null;
                                    const versionLabel = versionNum ? `V${versionNum}` : (next.version ?? 'V1');

                                    this.dbFunctionService.executeQuery(
                                        `UPDATE "acc_RevisionArchivo"
                                         SET nombrearchivomostrar = $1,
                                             etiquetaversion      = $2,
                                             fechamodificacion    = NOW()
                                         WHERE id = $3
                                           AND (nombrearchivomostrar IS NULL OR nombrearchivomostrar = '')`,
                                        [displayName, versionLabel, Number(f.id)],
                                    ).catch(() => { /* no bloquear si falla */ });

                                    next = { ...next, name: displayName, version: versionLabel };
                                } catch {
                                    /* sin cambios */
                                }
                            }

                            return next;
                        }),
                    );
                } catch {
                    enrichedFiles = rawFiles;
                }
            }

            return {
                id: row.review_id,
                sequenceId: row.sequence_id,
                round: row.round_number,
                name: row.name,
                notes: row.notes ?? '',
                status: String(row.status_name ?? 'OPEN').toUpperCase(),
                workflow: {
                    id: row.workflow_id,
                    name: row.workflow_name,
                    notes: row.workflow_notes ?? '',
                    steps: Array.isArray(row.steps_json) ? row.steps_json : [],
                },
                currentStep: {
                    order: row.current_step_number,
                    dueDate: row.current_step_due_date,
                    candidates: Array.isArray(row.candidates_current_json) ? row.candidates_current_json : [],
                },
                createdBy: row.created_by_json ?? null,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                finishedAt: row.finished_at,
                files: enrichedFiles,
                stats: {
                    total: row.files_total ?? 0,
                    approved: row.files_approved ?? 0,
                    rejected: row.files_rejected ?? 0,
                    progressPercent: Number(row.progress_percent ?? 0),
                },
                activity: Array.isArray(row.activity_json) ? row.activity_json : [],
                origen: 'GVR',
            };
        }

        const accessToken = await this.obtenerTokenValidoHelper.execute(userId);
        try {
            return await this.autodeskApiService.obtenerRevisionPorId(accessToken, projectId, reviewId);
        } catch {
            throw new BadRequestException('Revisión no encontrada.');
        }
    }
}
