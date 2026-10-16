export class AsignarIncidenciaDto {
  issueId: string;

  userIds?: number[]; // Array de IDs de usuarios a asignar. Array vacío [] para desasignar todos

  // Mantener compatibilidad con versión anterior (un solo usuario)

  userId?: number | null; // null para desasignar (deprecated, usar userIds: [] para desasignar)
}
