/** Operaciones de persistencia de revisiones internas, sin SQL ni nombres de funciones de BD. */
export abstract class InternalReviewsRepository {
  abstract obtenerFlujoTrabajoAprobacionGvrPorIdUnico<T = any>(
    params: any[],
  ): Promise<T | null>;
  abstract actualizarFlujoRevision<T = any>(params: any[]): Promise<T[]>;
  abstract addComentarioArchivoRevision<T = any>(params: any[]): Promise<T[]>;
  abstract agregarReferenciaRevision<T = any>(params: any[]): Promise<T[]>;
  abstract voidEntireReview<T = any>(params: any[]): Promise<T[]>;
  abstract cambiarEstadoFlujoTrabajoGvr<T = any>(params: any[]): Promise<T[]>;
  abstract crearFlujoRevision<T = any>(params: any[]): Promise<T[]>;
  abstract crearRevisionInterna<T = any>(params: any[]): Promise<T[]>;
  abstract delegarPasoRevision<T = any>(params: any[]): Promise<T[]>;
  abstract eliminarReferenciaRevision<T = any>(params: any[]): Promise<T[]>;
  abstract enviarResenaPaso<T = any>(params: any[]): Promise<T[]>;
  abstract getComentariosArchivoRevision<T = any>(params: any[]): Promise<T[]>;
  abstract guardarCandidatos<T = any>(
    isGvrNumericId: boolean,
    params: any[],
  ): Promise<T[]>;
  abstract iniciarPasoRevision<T = any>(params: any[]): Promise<T[]>;
  abstract obtenerReferenciasRevision<T = any>(params: any[]): Promise<T[]>;
  abstract obtenerRevisionInternaGvrPorId<T = any>(params: any[]): Promise<T[]>;
  abstract obtenerVersionesArchivos<T = any>(params: any[]): Promise<T[]>;
  abstract actualizarArchivoEnriquecido<T = any>(params: any[]): Promise<T[]>;
  abstract actualizarNombreVersionArchivo<T = any>(params: any[]): Promise<T[]>;
  abstract listarRevisionesInternasGvr<T = any>(params: any[]): Promise<T[]>;
  abstract listarCandidatosFlujoTrabajoGvr<T = any>(
    params: any[],
  ): Promise<T[]>;
  abstract listarWorkflowCandidatos<T = any>(params: any[]): Promise<T[]>;
  abstract obtenerFlujoTrabajoAprobacionGvrPorId<T = any>(
    params: any[],
  ): Promise<T[]>;
  abstract listarFlujosTrabajoAprobacionGvr<T = any>(
    params: any[],
  ): Promise<T[]>;
  abstract saltarPasoRevision<T = any>(params: any[]): Promise<T[]>;
  abstract volverPasoAnterior<T = any>(params: any[]): Promise<T[]>;
}
