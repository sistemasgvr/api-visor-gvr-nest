import type { IEmpresaRepository } from '../../../domain/repositories/empresa.repository.interface';
import { InvalidInputError } from '../../errors/application.error';
import { UpdateEmpresaDto } from '../../inputs/empresa/update-empresa.dto';

export class EditarEmpresaUseCase {
  constructor(private readonly empresaRepository: IEmpresaRepository) {}

  async execute(
    idEmpresa: number,
    updateDto: UpdateEmpresaDto,
    idUsuarioModificacion: number,
  ) {
    const resultado = await this.empresaRepository.editarEmpresa({
      idEmpresa,
      ...updateDto,
      idUsuarioModificacion,
    });

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al editar la empresa',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
