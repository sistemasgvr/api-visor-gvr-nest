import {
  ApplicationLogger,
  LoggerFactoryPort,
} from '../../../ports/runtime.port';

import type { VisorMarcaRevisionDetalle } from '../../../../domain/repositories/acc-visor-marca-revision.repository.interface';
import { BroadcastPort } from '../../../ports/broadcast.port';

export type VisorMarcaRevisionSyncAction =
  | 'created'
  | 'updated'
  | 'published'
  | 'unpublished'
  | 'deleted'
  | 'duplicated';

export interface VisorMarcaRevisionSyncPayload {
  action: VisorMarcaRevisionSyncAction;
  idProyectoAcc: string;
  documentUrn: string;
  viewableGuid: string | null;
  paginaNumero: number | null;
  versionId: string | null;
  idRevisionArchivo: number | null;
  markupId: number;
  actorUserId: number;
  markup: VisorMarcaRevisionDetalle | null;
}

export class VisorMarcaRevisionSyncService {
  private readonly logger: ApplicationLogger;

  constructor(
    private readonly broadcastService: BroadcastPort,
    private readonly loggerFactory: LoggerFactoryPort,
  ) {
    this.logger = this.loggerFactory.create(VisorMarcaRevisionSyncService.name);
  }

  static channelForProject(idProyectoAcc: string): string {
    return `acc.projects.${idProyectoAcc}.visor-marcas-revision`;
  }

  emit(
    action: VisorMarcaRevisionSyncAction,
    markup: VisorMarcaRevisionDetalle,
    actorUserId: number,
  ): void {
    try {
      const payload: VisorMarcaRevisionSyncPayload = {
        action,
        idProyectoAcc: markup.idProyectoAcc,
        documentUrn: markup.documentUrn,
        viewableGuid: markup.viewableGuid ?? null,
        paginaNumero: markup.paginaNumero ?? null,
        versionId: markup.versionId ?? null,
        idRevisionArchivo: markup.idRevisionArchivo ?? null,
        markupId: markup.id,
        actorUserId,
        markup,
      };
      const channel = VisorMarcaRevisionSyncService.channelForProject(
        markup.idProyectoAcc,
      );
      this.broadcastService.emit(
        channel,
        `visor-marca-revision.${action}`,
        payload,
      );
    } catch (err: unknown) {
      this.logger.warn(
        `No se pudo emitir sync de marca ${action}: ${(err as Error)?.message ?? err}`,
      );
    }
  }

  emitDeleted(snapshot: VisorMarcaRevisionDetalle, actorUserId: number): void {
    try {
      const payload: VisorMarcaRevisionSyncPayload = {
        action: 'deleted',
        idProyectoAcc: snapshot.idProyectoAcc,
        documentUrn: snapshot.documentUrn,
        viewableGuid: snapshot.viewableGuid ?? null,
        paginaNumero: snapshot.paginaNumero ?? null,
        versionId: snapshot.versionId ?? null,
        idRevisionArchivo: snapshot.idRevisionArchivo ?? null,
        markupId: snapshot.id,
        actorUserId,
        markup: null,
      };
      const channel = VisorMarcaRevisionSyncService.channelForProject(
        snapshot.idProyectoAcc,
      );
      this.broadcastService.emit(
        channel,
        'visor-marca-revision.deleted',
        payload,
      );
    } catch (err: unknown) {
      this.logger.warn(
        `No se pudo emitir sync deleted: ${(err as Error)?.message ?? err}`,
      );
    }
  }
}
