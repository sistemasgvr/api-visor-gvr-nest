import { Injectable } from '@nestjs/common';
import { InternalReviewsRepository } from '../../application/ports/internal-reviews.repository';
import { DatabaseFunctionService } from '../database/database-function.service';

@Injectable()
export class PostgresInternalReviewsRepository implements InternalReviewsRepository {
  constructor(private readonly database: DatabaseFunctionService) {}
  obtenerFlujoTrabajoAprobacionGvrPorIdUnico<T = any>(
    params: any[],
  ): Promise<T | null> {
    return this.database.callFunctionSingle<T>(
      'acc_ObtenerFlujoTrabajoAprobacionGvrPorId',
      params,
    );
  }
  actualizarFlujoRevision<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>('acc_ActualizarFlujoRevision', params);
  }
  addComentarioArchivoRevision<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>(
      'acc_AddComentarioArchivoRevision',
      params,
    );
  }
  agregarReferenciaRevision<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>(
      'acc_AgregarReferenciaRevision',
      params,
    );
  }
  voidEntireReview<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>('acc_VoidEntireReview', params);
  }
  cambiarEstadoFlujoTrabajoGvr<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>(
      'acc_CambiarEstadoFlujoTrabajoGvr',
      params,
    );
  }
  crearFlujoRevision<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>('acc_CrearFlujoRevision', params);
  }
  crearRevisionInterna<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>('acc_CrearRevisionInterna', params);
  }
  delegarPasoRevision<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>('acc_DelegarPasoRevision', params);
  }
  eliminarReferenciaRevision<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>(
      'acc_EliminarReferenciaRevision',
      params,
    );
  }
  enviarResenaPaso<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>('acc_EnviarResenaPaso', params);
  }
  getComentariosArchivoRevision<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>(
      'acc_GetComentariosArchivoRevision',
      params,
    );
  }
  guardarCandidatos<T = any>(
    isGvrNumericId: boolean,
    params: any[],
  ): Promise<T[]> {
    return this.database.callFunction<T>(
      isGvrNumericId
        ? 'acc_GuardarFlujoCandidatosGvr'
        : 'acc_GuardarWorkflowCandidatos',
      params,
    );
  }
  iniciarPasoRevision<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>('acc_IniciarPasoRevision', params);
  }
  obtenerReferenciasRevision<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>(
      'acc_ObtenerReferenciasRevision',
      params,
    );
  }
  obtenerRevisionInternaGvrPorId<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>(
      'acc_ObtenerRevisionInternaGvrPorId',
      params,
    );
  }
  obtenerVersionesArchivos<T = any>(params: any[]): Promise<T[]> {
    return this.database.executeQuery<T>(
      'SELECT id, urnversionacc FROM "acc_RevisionArchivo" WHERE id = ANY($1::int[]) AND estado = 1',
      params,
    );
  }
  actualizarArchivoEnriquecido<T = any>(params: any[]): Promise<T[]> {
    return this.database.executeQuery<T>(
      "UPDATE \"acc_RevisionArchivo\"\n                                             SET urnitemacc = $1,\n                                                 fechamodificacion = NOW()\n                                             WHERE id = $2\n                                               AND (urnitemacc IS NULL OR TRIM(COALESCE(urnitemacc, '')) = '')",
      params,
    );
  }
  actualizarNombreVersionArchivo<T = any>(params: any[]): Promise<T[]> {
    return this.database.executeQuery<T>(
      'UPDATE "acc_RevisionArchivo"\n                                         SET nombrearchivomostrar = $1,\n                                             etiquetaversion      = $2,\n                                             fechamodificacion    = NOW()\n                                         WHERE id = $3\n                                           AND (nombrearchivomostrar IS NULL OR nombrearchivomostrar = \'\')',
      params,
    );
  }
  listarRevisionesInternasGvr<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>(
      'acc_ListarRevisionesInternasGvr',
      params,
    );
  }
  listarCandidatosFlujoTrabajoGvr<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>(
      'acc_ListarCandidatosFlujoTrabajoGvr',
      params,
    );
  }
  listarWorkflowCandidatos<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>(
      'acc_ListarWorkflowCandidatos',
      params,
    );
  }
  obtenerFlujoTrabajoAprobacionGvrPorId<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>(
      'acc_ObtenerFlujoTrabajoAprobacionGvrPorId',
      params,
    );
  }
  listarFlujosTrabajoAprobacionGvr<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>(
      'acc_ListarFlujosTrabajoAprobacionGvr',
      params,
    );
  }
  saltarPasoRevision<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>('acc_SaltarPasoRevision', params);
  }
  volverPasoAnterior<T = any>(params: any[]): Promise<T[]> {
    return this.database.callFunction<T>('acc_VolverPasoAnterior', params);
  }
}
