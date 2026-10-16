import type { IEmpresaRepository } from '../../../domain/repositories/empresa.repository.interface';
import { InvalidInputError } from '../../errors/application.error';

export class EliminarEmpresaUseCase {
  constructor(private readonly empresaRepository: IEmpresaRepository) {}

  async execute(idEmpresa: number, idUsuarioModificacion: number) {
    const resultado = await this.empresaRepository.eliminarEmpresa(
      idEmpresa,
      idUsuarioModificacion,
    );

    if (!resultado || !resultado.success) {
      throw new InvalidInputError(
        resultado?.message || 'Error al eliminar la empresa',
      );
    }

    return {
      message: resultado.message,
    };
  }
}
