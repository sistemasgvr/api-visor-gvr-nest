import type { AutodeskBim360Port } from '../../ports/autodesk/bim360.port';

import { type IAccRecursosRepository } from '../../../domain/repositories/acc-recursos.repository.interface';
import { type IAuditoriaRepository } from '../../../domain/repositories/auditoria.repository.interface';
import ObtenerTokenValidoHelper from '../acc/issues/obtener-token-valido.helper';

export class ObtenerIncidenciaPorIdBim360UseCase {
  constructor(
    private readonly autodeskApiService: AutodeskBim360Port,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,

    private readonly auditoriaRepository: IAuditoriaRepository,

    private readonly accRecursosRepository: IAccRecursosRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    issueId: string,
  ): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);
    const resultado =
      await this.autodeskApiService.obtenerIncidenciaPorIdBim360(
        accessToken,
        projectId,
        issueId,
      );

    if (!resultado || !resultado.id) {
      return resultado;
    }

    try {
      // Buscar en auditoría el registro de creación de esta incidencia
      const registroCreacion =
        await this.auditoriaRepository.obtenerAuditoriaPorMetadatos(
          'issue',
          'ISSUE_CREATE',
          'accIssueId',
          resultado.id,
        );

      // Buscar asignación de la incidencia
      const recursoAsignacion = await this.accRecursosRepository.obtenerRecurso(
        'issue',
        resultado.id,
      );

      let issueEnriquecida: any = { ...resultado };

      // Agregar información del creador real
      if (registroCreacion && registroCreacion.usuario) {
        issueEnriquecida = {
          ...issueEnriquecida,
          createdByReal: registroCreacion.usuario,
          createdByRealId: registroCreacion.idusuario,
          createdByRealRole: registroCreacion.rol || null,
          createdByRealEmpresa: registroCreacion.empresa || null,
          createdByAcc: resultado.createdBy,
        };
      }

      // Agregar información del usuario asignado
      if (recursoAsignacion && recursoAsignacion.idusuario_asignado) {
        issueEnriquecida = {
          ...issueEnriquecida,
          assignedToReal: recursoAsignacion.usuario_asignado,
          assignedToRealId: recursoAsignacion.idusuario_asignado,
          assignedToRealRole: recursoAsignacion.rol_asignado || null,
        };
      }

      return issueEnriquecida;
    } catch (error) {
      // Si falla el enriquecimiento, retornar resultado original
      return resultado;
    }
  }
}
