import { type IAccRecursosRepository } from '../../../domain/repositories/acc-recursos.repository.interface';
import { type IAuditoriaRepository } from '../../../domain/repositories/auditoria.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { GuardarRecursoDto } from '../../inputs/acc-recursos/guardar-recurso.dto';

export class GuardarRecursoUseCase {
  constructor(
    private readonly accRecursosRepository: IAccRecursosRepository,

    private readonly auditoriaRepository: IAuditoriaRepository,
  ) {}

  async execute(
    dto: GuardarRecursoDto,
    idUsuarioCreacion: number,
    ipAddress: string,
    userAgent: string,
  ): Promise<any> {
    if (!dto.recurso_tipo) {
      throw new InvalidInputError('El tipo de recurso es requerido');
    }
    if (!dto.recurso_id) {
      throw new InvalidInputError('El ID del recurso es requerido');
    }

    const resultado = await this.accRecursosRepository.guardarRecurso(
      dto.recurso_tipo,
      dto.recurso_id,
      dto.recurso_urn || null,
      dto.project_id || null,
      dto.parent_id || null,
      dto.idusuario_creador,
      dto.idusuario_asignado || null,
      dto.nombre || null,
      dto.descripcion || null,
      dto.estado || null,
      dto.metadatos || {},
      idUsuarioCreacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al guardar recurso ACC',
      );
    }

    await this.auditoriaRepository.registrarAccion(
      idUsuarioCreacion,
      'ACC_RESOURCE_CREATE',
      'accrecursosusuarios',
      dto.recurso_id,
      `Recurso ACC tipo '${dto.recurso_tipo}' creado`,
      null,
      {
        recurso_tipo: dto.recurso_tipo,
        recurso_id: dto.recurso_id,
        nombre: dto.nombre,
      },
      ipAddress,
      userAgent,
      { project_id: dto.project_id },
    );

    return {
      success: true,
      message: resultado.message,
      id_recurso: resultado.id_recurso,
    };
  }
}
