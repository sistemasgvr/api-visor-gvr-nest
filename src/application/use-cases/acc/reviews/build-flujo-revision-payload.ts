import { CrearWorkflowDto, WorkflowCandidatoInput } from '../../../dtos/acc/reviews/crear-workflow.dto';

/** Resuelve nombre de opción BD acc_flujo_estado */
export function resolveEstadoFlujoNombre(dto: CrearWorkflowDto): 'Activo' | 'Borrador' {
    if (dto.workflowStatus === 'INACTIVE') return 'Borrador';
    if (dto.workflowStatus === 'ACTIVE') return 'Activo';
    if (dto.saveAsDraft) return 'Borrador';
    return 'Activo';
}

/**
 * JSON enviado a acc_CrearFlujoRevision / acc_ActualizarFlujoRevision.
 */
export function buildFlujoRevisionPayload(
    dto: CrearWorkflowDto,
    estadoFlujoNombre: 'Activo' | 'Borrador',
): Record<string, unknown> {
    const steps = dto.steps ?? [];
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

    const updateAttrs = dto.updateAttributesOptions ?? {};
    const actualizarAtributosAlCerrarRevision = !!updateAttrs.enableAttachedAttributes;

    return {
        nombre: dto.name,
        descripcion: dto.description ?? '',
        notas: dto.notes ?? '',
        tipoIniciador: 'Cualquier usuario con acceso al proyecto',
        idUsuarioIniciador: null,
        idRolIniciador: null,
        idEmpresaIniciador: null,
        accionAlFinalizar: 'Ninguna',
        estadoFlujo: estadoFlujoNombre,
        permitirEdicionIniciador: dto.additionalOptions?.allowInitiatorToEdit ?? false,
        permitirDevolucionIniciador: false,
        copiaHabilitada: copyEnabled,
        actualizarAtributosAlCerrarRevision,
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
}
