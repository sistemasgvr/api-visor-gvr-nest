import type { AutodeskIssuesPort } from '../../../ports/autodesk/issues.port';

import { type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';
import { CrearComentarioDto } from '../../../inputs/acc/issues/crear-comentario.dto';
import ObtenerTokenValidoHelper from './obtener-token-valido.helper';

export class CrearComentarioUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskIssuesPort,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,

    private readonly auditoriaRepository: IAuditoriaRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    issueId: string,
    dto: CrearComentarioDto,
    ipAddress: string,
    userAgent: string,
    userRole?: string,
  ): Promise<any> {
    const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

    const data = {
      body: dto.body,
    };

    const resultado = await this.autodeskApiService.crearComentario(
      accessToken,
      projectId,
      issueId,
      data,
    );

    // El servicio retorna directamente el objeto del comentario, no envuelto en data
    // Verificar si el comentario se creó exitosamente
    const commentId = resultado?.id || resultado?.data?.id;

    if (resultado && commentId) {
      try {
        // El ID del comentario de ACC es un string (UUID), no se puede usar como identidad (BIGINT)
        // Por lo tanto, usamos null para identidad y guardamos el ID real en metadatos
        await this.auditoriaRepository.registrarAccion(
          userId,
          'COMMENT_CREATE',
          'issue_comment',
          null, // No usar el ID de ACC como identidad porque es string
          `Comentario creado en incidencia ${issueId}`,
          null,
          {
            commentId,
            issueId,
            projectId,
            body: dto.body.substring(0, 200), // Limitar tamaño para auditoría
          },
          ipAddress,
          userAgent,
          {
            projectId,
            issueId,
            accCommentId: commentId, // ID del comentario de ACC (string/UUID)
            rol: userRole || null, // Rol del usuario al momento de crear el comentario
          },
        );
      } catch (error) {
        // No fallar la operación si la auditoría falla, solo loguear silenciosamente
        // El error se puede monitorear desde los logs de la base de datos
      }
    }

    return resultado;
  }
}
