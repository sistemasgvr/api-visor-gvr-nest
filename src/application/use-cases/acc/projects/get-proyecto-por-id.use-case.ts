import type { AutodeskAdminPort } from '../../../ports/autodesk/admin.port';

import { type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';
import { GetProyectoPorIdDto } from '../../../inputs/acc/projects/get-proyecto-por-id.dto';

export class GetProyectoPorIdUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskAdminPort,

    private readonly auditoriaRepository: IAuditoriaRepository,
  ) {}

  async execute(projectId: string, dto: GetProyectoPorIdDto): Promise<any> {
    const fields = dto.fields ? dto.fields.split(',').map((f) => f.trim()) : [];

    const resultado = await this.autodeskApiService.getAccProjectById(
      projectId,
      fields,
      dto.token,
    );

    // Enriquecer proyecto con información de auditoría
    if (resultado) {
      try {
        // Buscar en auditoría el registro de creación de este proyecto
        const registroCreacion =
          await this.auditoriaRepository.obtenerAuditoriaPorMetadatos(
            'project',
            'PROJECT_CREATE',
            'accProjectId',
            projectId,
          );

        if (registroCreacion && registroCreacion.usuario) {
          return {
            ...resultado,
            createdByReal: registroCreacion.usuario,
            createdByRealId: registroCreacion.idusuario,
            createdByRealRole: registroCreacion.rol || null,
            createdByRealEmpresa: registroCreacion.empresa || null,
          };
        }
      } catch (error) {
        // Si falla la búsqueda, retornar proyecto original
      }
    }

    return resultado;
  }
}
