import type { IEmpresaRepository } from '../../../domain/repositories/empresa.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { CreateEmpresaDto } from '../../inputs/empresa/create-empresa.dto';

export class CrearEmpresaUseCase {
  constructor(private readonly empresaRepository: IEmpresaRepository) {}

  async execute(createDto: CreateEmpresaDto, idUsuarioCreacion: number) {
    const resultado = await this.empresaRepository.crearEmpresa({
      ...createDto,
      idUsuarioCreacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al crear la empresa',
      );
    }

    return {
      message: resultado.message,
      id_empresa: resultado.id_empresa,
    };
  }
}
