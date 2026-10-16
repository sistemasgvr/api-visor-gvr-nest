import type { AutodeskIssuesPort } from '../../../ports/autodesk/issues.port';

import { type IAccRecursosRepository } from '../../../../domain/repositories/acc-recursos.repository.interface';
import { type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';
import { ObtenerIncidenciasPorDocumentoDto } from '../../../inputs/acc/issues/obtener-incidencias-por-documento.dto';
import ObtenerTokenValidoHelper from './obtener-token-valido.helper';

export class ObtenerIncidenciasPorDocumentoUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskIssuesPort,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,

    private readonly auditoriaRepository: IAuditoriaRepository,

    private readonly accRecursosRepository: IAccRecursosRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    dto: ObtenerIncidenciasPorDocumentoDto,
  ): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

    // Intentar filtrar por linkedDocumentUrn
    const filters: Record<string, any> = {
      'filter[linkedDocumentUrn]': dto.documentUrn,
    };
    if (dto.limit) filters.limit = dto.limit.toString();
    if (dto.offset) filters.offset = dto.offset.toString();

    try {
      const result = await this.autodeskApiService.obtenerIncidencias(
        accessToken,
        projectId,
        filters,
      );
      if (result.results && result.results.length > 0) {
        // Enriquecer incidencias con información del usuario real desde auditoría
        const incidenciasEnriquecidas = await Promise.all(
          result.results.map(async (issue: any) => {
            try {
              // Buscar en auditoría el registro de creación de esta incidencia
              const registroCreacion =
                await this.auditoriaRepository.obtenerAuditoriaPorMetadatos(
                  'issue',
                  'ISSUE_CREATE',
                  'accIssueId',
                  issue.id,
                );

              // Buscar asignación de la incidencia
              const recursoAsignacion =
                await this.accRecursosRepository.obtenerRecurso(
                  'issue',
                  issue.id,
                );

              let issueEnriquecida: any = { ...issue };

              // Agregar información del creador real
              if (registroCreacion && registroCreacion.usuario) {
                issueEnriquecida = {
                  ...issueEnriquecida,
                  createdByReal: registroCreacion.usuario,
                  createdByRealId: registroCreacion.idusuario,
                  createdByRealRole: registroCreacion.rol || null,
                  createdByRealEmpresa: registroCreacion.empresa || null,
                  createdByAcc: issue.createdBy,
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
              // Si falla la búsqueda de auditoría, retornar incidencia original
              return issue;
            }
          }),
        );

        return {
          data: incidenciasEnriquecidas,
          pagination: result.pagination || {},
        };
      }
    } catch (error) {
      // Si el filtro no es soportado, continuar con obtener todas las incidencias
    }

    // Obtener todas las incidencias y filtrar manualmente
    const allIssues = await this.autodeskApiService.obtenerIncidencias(
      accessToken,
      projectId,
      {},
    );
    const issues = allIssues.results || [];

    // Filtrar por documento (lógica simplificada)
    const filteredIssues = issues.filter((issue: any) => {
      if (!issue.linkedDocuments || issue.linkedDocuments.length === 0) {
        return false;
      }
      return issue.linkedDocuments.some((doc: any) => {
        const docUrn = doc.urn || '';
        return (
          docUrn.includes(dto.documentUrn) || dto.documentUrn.includes(docUrn)
        );
      });
    });

    // Enriquecer incidencias filtradas con información del usuario real desde auditoría
    if (Array.isArray(filteredIssues) && filteredIssues.length > 0) {
      const incidenciasEnriquecidas = await Promise.all(
        filteredIssues.map(async (issue: any) => {
          try {
            // Buscar en auditoría el registro de creación de esta incidencia
            const registroCreacion =
              await this.auditoriaRepository.obtenerAuditoriaPorMetadatos(
                'issue',
                'ISSUE_CREATE',
                'accIssueId',
                issue.id,
              );

            // Buscar asignación de la incidencia
            const recursoAsignacion =
              await this.accRecursosRepository.obtenerRecurso(
                'issue',
                issue.id,
              );

            let issueEnriquecida: any = { ...issue };

            // Agregar información del creador real
            if (registroCreacion && registroCreacion.usuario) {
              issueEnriquecida = {
                ...issueEnriquecida,
                createdByReal: registroCreacion.usuario,
                createdByRealId: registroCreacion.idusuario,
                createdByRealRole: registroCreacion.rol || null,
                createdByRealEmpresa: registroCreacion.empresa || null,
                // Mantener createdBy original de ACC para referencia
                createdByAcc: issue.createdBy,
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
            // Si falla la búsqueda de auditoría, retornar incidencia original
            return issue;
          }
        }),
      );

      return {
        data: incidenciasEnriquecidas,
        pagination: allIssues.pagination || {},
      };
    }

    return {
      data: filteredIssues,
      pagination: allIssues.pagination || {},
    };
  }
}
