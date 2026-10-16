import { type IAccRecursosRepository } from '../../../domain/repositories/acc-recursos.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { ObtenerRecursosUsuarioDto } from '../../inputs/acc-recursos/obtener-recursos-usuario.dto';

export class ObtenerRecursosUsuarioUseCase {
  constructor(private readonly accRecursosRepository: IAccRecursosRepository) {}

  async execute(
    idUsuario: number,
    dto: ObtenerRecursosUsuarioDto,
  ): Promise<any> {
    const limit = dto.limit || 20;
    const offset = dto.offset || 0;
    const rol = dto.rol || 'creador';

    const rolesValidos = ['creador', 'asignado', 'modifico'];
    if (!rolesValidos.includes(rol)) {
      throw new InvalidInputError(
        'Rol inválido. Debe ser: creador, asignado o modifico',
      );
    }

    const recursos = await this.accRecursosRepository.obtenerRecursosUsuario(
      idUsuario,
      dto.tipo || null,
      rol,
      limit,
      offset,
    );

    if (!recursos || recursos.length === 0) {
      return {
        data: [],
        pagination: {
          total: 0,
          limit,
          offset,
          total_pages: 0,
          current_page: 1,
        },
      };
    }

    const totalRegistros = recursos[0]?.total_registros || 0;

    return {
      data: recursos,
      pagination: {
        total: Number(totalRegistros),
        limit,
        offset,
        total_pages: limit > 0 ? Math.ceil(Number(totalRegistros) / limit) : 0,
        current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
      },
    };
  }
}
