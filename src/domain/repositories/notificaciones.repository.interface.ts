export interface INotificacionesRepository {
    /**
     * Guarda una notificación pendiente para un usuario
     * @param idUsuario ID del usuario que recibirá la notificación
     * @param tipo Tipo de notificación (issue_assigned, comment_created, document_shared, etc.)
     * @param titulo Título de la notificación
     * @param mensaje Mensaje de la notificación (opcional)
     * @param datos Objeto JSONB con toda la información específica del tipo de notificación
     */
    guardarNotificacionPendiente(
        idUsuario: number,
        tipo: string,
        titulo: string,
        mensaje: string | null,
        datos: any,
    ): Promise<any>;

    /**
     * Obtiene las notificaciones pendientes de un usuario (entregada = false, estado = 1)
     * @param idUsuario ID del usuario
     * @param tipo Tipo de notificación opcional para filtrar
     */
    obtenerNotificacionesPendientes(idUsuario: number, tipo?: string): Promise<any[]>;

    /**
     * Obtiene todas las notificaciones del usuario (pendientes y entregadas), estado = 1
     */
    obtenerNotificaciones(idUsuario: number, tipo?: string): Promise<any[]>;

    /**
     * Marca una notificación como entregada
     */
    marcarComoEntregada(id: number): Promise<void>;

    /**
     * Marca todas las notificaciones de un usuario como entregadas
     */
    marcarTodasComoEntregadas(idUsuario: number): Promise<void>;

    /**
     * Soft delete: pone estado = 0. Solo si idUsuario es el dueño.
     */
    eliminarNotificacion(id: number, idUsuario: number): Promise<boolean>;

    /**
     * Soft delete de todas las notificaciones del usuario (estado = 0)
     */
    eliminarTodasNotificaciones(idUsuario: number): Promise<void>;
}

export const NOTIFICACIONES_REPOSITORY = Symbol('NOTIFICACIONES_REPOSITORY');

