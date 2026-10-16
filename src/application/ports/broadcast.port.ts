/** Contrato de aplicación; la implementación y su configuración pertenecen a infraestructura. */

export abstract class BroadcastPort {
  abstract emitMenuCreated(menu: any): void;
  abstract emitMenuUpdated(menu: any): void;
  abstract emitMenuDeleted(menuId: number): void;
  abstract emit(channel: string, event: string, data: any): void;
  abstract emitToAll(event: string, data: any): void;
  abstract emitDocumentSaveStarted(
    userId: number,
    data: { projectId: string; itemId: string; fileName: string },
  ): void;
  abstract emitDocumentSaved(
    userId: number,
    data: { projectId: string; itemId: string; fileName: string },
  ): void;
  abstract emitNotificationToUser(
    userId: number,
    notification: any,
  ): Promise<void>;
}
