import { type IAccRecursosRepository } from '../../../domain/repositories/acc-recursos.repository.interface';
import { type IAuditoriaRepository } from '../../../domain/repositories/auditoria.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { ActualizarRecursoDto } from '../../inputs/acc-recursos/actualizar-recurso.dto';

export class ActualizarRecursoUseCase {
  constructor(
    private readonly accRecursosRepository: IAccRecursosRepository,

    private readonly auditoriaRepository: IAuditoriaRepository,
  ) {}

  async execute(
    recursoTipo: string,
    recursoId: string,
    dto: ActualizarRecursoDto,
    idUsuarioModificacion: number,
    ipAddress: string,
    userAgent: string,
  ): Promise<any> {
    const recursoActual = await this.accRecursosRepository.obtenerRecurso(
      recursoTipo,
      recursoId,
    );

    const datosAnteriores = recursoActual
      ? {
          idusuario_asignado: recursoActual.idusuario_asignado,
          estado: recursoActual.estado,
        }
      : null;

    const resultado = await this.accRecursosRepository.actualizarRecurso(
      recursoTipo,
      recursoId,
      dto.idusuario_asignado || null,
      idUsuarioModificacion,
      dto.estado || null,
      dto.metadatos || null,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al actualizar recurso ACC',
      );
    }

    const accion = dto.idusuario_asignado
      ? 'ACC_RESOURCE_ASSIGN'
      : 'ACC_RESOURCE_UPDATE';
    const descripcion = dto.idusuario_asignado
      ? `Recurso reasignado a usuario ${dto.idusuario_asignado}`
      : 'Recurso actualizado';

    await this.auditoriaRepository.registrarAccion(
      idUsuarioModificacion,
      accion,
      'accrecursosusuarios',
      recursoId,
      descripcion,
      datosAnteriores,
      {
        idusuario_asignado: dto.idusuario_asignado,
        estado: dto.estado,
      },
      ipAddress,
      userAgent,
      { recurso_tipo: recursoTipo },
    );

    return {
      success: true,
      message: resultado.message,
    };
  }
}
