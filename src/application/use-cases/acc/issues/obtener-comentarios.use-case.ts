import type { AutodeskIssuesPort } from '../../../ports/autodesk/issues.port';

import { type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';
import { ObtenerComentariosDto } from '../../../inputs/acc/issues/obtener-comentarios.dto';
import ObtenerTokenValidoHelper from './obtener-token-valido.helper';

export class ObtenerComentariosUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskIssuesPort,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,

    private readonly auditoriaRepository: IAuditoriaRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    issueId: string,
    dto: ObtenerComentariosDto,
  ): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

    const filters: Record<string, any> = {};
    if (dto.limit) filters.limit = dto.limit.toString();
    if (dto.offset) filters.offset = dto.offset.toString();
    if (dto.sort) filters.sort = dto.sort;

    const resultado = await this.autodeskApiService.obtenerComentarios(
      accessToken,
      projectId,
      issueId,
      filters,
    );

    // Enriquecer comentarios con información del usuario real desde auditoría
    if (resultado && resultado.data && Array.isArray(resultado.data)) {
      const comentariosEnriquecidos = await Promise.all(
        resultado.data.map(async (comment: any) => {
          try {
            // Buscar en auditoría el registro de creación de este comentario usando metadatos
            // porque el ID de ACC es un string (UUID) y no se puede usar directamente como identidad
            const registroCreacion =
              await this.auditoriaRepository.obtenerAuditoriaPorMetadatos(
                'issue_comment',
                'COMMENT_CREATE',
                'accCommentId',
                comment.id,
              );

            if (registroCreacion && registroCreacion.usuario) {
              return {
                ...comment,
                createdByReal: registroCreacion.usuario,
                createdByRealId: registroCreacion.idusuario,
                createdByRealRole: registroCreacion.rol || null,
                createdByRealEmpresa: registroCreacion.empresa || null,
                // Mantener createdBy original de ACC para referencia
                createdByAcc: comment.createdBy,
              };
            }

            return comment;
          } catch (error) {
            // Si falla la búsqueda de auditoría, retornar comentario original
            console.error(
              `Error al enriquecer comentario ${comment.id}:`,
              error,
            );
            return comment;
          }
        }),
      );

      return {
        ...resultado,
        data: comentariosEnriquecidos,
      };
    }

    return resultado;
  }
}
