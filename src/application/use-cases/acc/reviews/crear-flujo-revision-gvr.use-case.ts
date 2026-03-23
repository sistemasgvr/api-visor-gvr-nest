import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';
import { CrearWorkflowDto, WorkflowCandidatoInput } from '../../../dtos/acc/reviews/crear-workflow.dto';

export interface CrearFlujoRevisionGvrResult {
    id: string;
    name: string;
    idProyectoAcc: string;
    mensaje: string;
}

/**
 * Crea un flujo de trabajo de aprobación en la BD GVR (acc_FlujoTrabajoAprobacion,
 * acc_FlujoTrabajoAprobacionPaso, acc_FlujoTrabajoAprobacionPasoAsignacion) mediante
 * la función acc_CrearFlujoRevision.
 */
@Injectable()
export class CrearFlujoRevisionGvrUseCase {
    constructor(
        private readonly dbFunctionService: DatabaseFunctionService,
    ) {}

    async execute(
        userId: number,
        projectId: string,
        dto: CrearWorkflowDto,
    ): Promise<CrearFlujoRevisionGvrResult> {
        const steps = dto.steps ?? [];
        if (steps.length === 0) {
            throw new BadRequestException('Debe incluir al menos un paso (iniciador).');
        }

        const candidatos: WorkflowCandidatoInput[] = dto.candidatos ?? [];

        const pasos = steps.map((step: any, index: number) => {
            const tipoPaso = (step.type ?? 'REVIEWER').toUpperCase();
            const asignacionesForPaso = candidatos
                .filter(
                    (c) =>
                        Number(c.ordenPaso) === index &&
                        (c.tipoPaso?.toUpperCase() ?? '') === tipoPaso,
                )
                .map((c) => ({
                    idUsuario: c.idUsuario,
                    esRequeridoEnGrupo: !c.esOpcional,
                }));

            const groupReview = step.groupReview;
            const revisionGrupalHabilitada = !!groupReview?.enabled;
            const modoRevisionGrupal = groupReview?.type ?? null;
            const minimoParticipantesRequeridos =
                groupReview?.min ?? (revisionGrupalHabilitada && asignacionesForPaso.length > 0
                    ? asignacionesForPaso.filter((a) => a.esRequeridoEnGrupo).length || 1
                    : null);

            return {
                ordenPaso: index,
                nombrePaso: step.name ?? `Paso ${index}`,
                tipoPaso,
                duracionPaso: step.duration ?? null,
                tipoVencimientoPaso: step.dueDateType ?? 'CALENDAR_DAY',
                revisionGrupalHabilitada,
                modoRevisionGrupal,
                minimoParticipantesRequeridos,
                exigenciaAprobacion: revisionGrupalHabilitada ? 'Mínimo K de N' : 'Uno basta',
                asignaciones: asignacionesForPaso,
            };
        });

        const copy = dto.copyFilesOptions ?? {};
        const copyEnabled = !!copy.enabled;
        const condicionRaw = String(copy.condition ?? 'ANY').toUpperCase();
        const condicionCopiaArchivos = condicionRaw === 'ALL' ? 'ALL' : 'ANY';
        const carpetaDestinoCopiaReferencia = String(
            copy.folderUrn ?? (copy as { targetFolderId?: string }).targetFolderId ?? '',
        ).trim();
        const permitirIniciadorCambiarCarpetaDestino = !!copy.allowOverride;
        const incluirMarcasPublicadasEnCopia = copy.includeMarkups !== false;
        const allowApproversChange =
            (copy as { allowApproversChangeMarkups?: boolean }).allowApproversChangeMarkups !== false;
        const disableOverrideMarkup = (copy as { disableOverrideMarkupSetting?: boolean })
            .disableOverrideMarkupSetting;
        const permitirAprobadoresModificarInclusionMarcas =
            disableOverrideMarkup !== undefined
                ? disableOverrideMarkup === false
                : allowApproversChange;

        const payload = {
            nombre: dto.name,
            descripcion: dto.description ?? '',
            notas: dto.notes ?? '',
            tipoIniciador: 'Cualquier usuario con acceso al proyecto',
            idUsuarioIniciador: null,
            idRolIniciador: null,
            idEmpresaIniciador: null,
            accionAlFinalizar: 'Ninguna',
            estadoFlujo: 'Activo',
            permitirEdicionIniciador: dto.additionalOptions?.allowInitiatorToEdit ?? false,
            permitirDevolucionIniciador: false,
            copiaHabilitada: copyEnabled,
            ...(copyEnabled
                ? {
                      condicionCopiaArchivos,
                      carpetaDestinoCopiaReferencia:
                          carpetaDestinoCopiaReferencia.length > 0 ? carpetaDestinoCopiaReferencia : null,
                      permitirIniciadorCambiarCarpetaDestino,
                      incluirMarcasPublicadasEnCopia,
                      permitirAprobadoresModificarInclusionMarcas,
                  }
                : {}),
            pasos,
        };

        let result: {
            id: number;
            nombre: string;
            idProyectoAcc: string;
            mensaje: string;
        }[];
        try {
            result = await this.dbFunctionService.callFunction<{
                id: number;
                nombre: string;
                idProyectoAcc: string;
                mensaje: string;
            }>('acc_CrearFlujoRevision', [projectId, userId, JSON.stringify(payload)]);
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            throw new BadRequestException(
                msg.includes('listado') || msg.includes('violates')
                    ? 'Error al crear el flujo: verifique datos y seeds de listados (acc_flujo_*).'
                    : msg,
            );
        }

        const row = result?.[0];
        if (!row?.id) {
            throw new BadRequestException(
                row?.mensaje ?? 'No se pudo crear el flujo de trabajo.',
            );
        }

        return {
            id: String(row.id),
            name: row.nombre ?? dto.name,
            idProyectoAcc: row.idProyectoAcc ?? projectId,
            mensaje: row.mensaje ?? 'Flujo creado correctamente.',
        };
    }
}
