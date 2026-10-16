import type {
  INovedadRepository,
  ListarNovedadLanzamientosParams,
} from '../../../domain/repositories/novedad.repository.interface';

export class ListarNovedadLanzamientosUseCase {
  constructor(private readonly novedadRepository: INovedadRepository) {}

  async execute(params: ListarNovedadLanzamientosParams) {
    return await this.novedadRepository.listarLanzamientos(params);
  }
}
