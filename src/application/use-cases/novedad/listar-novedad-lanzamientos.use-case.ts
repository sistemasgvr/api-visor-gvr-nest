import { Injectable, Inject } from '@nestjs/common';
import type {
  INovedadRepository,
  ListarNovedadLanzamientosParams,
} from '../../../domain/repositories/novedad.repository.interface';
import { NOVEDAD_REPOSITORY } from '../../../domain/repositories/novedad.repository.interface';

@Injectable()
export class ListarNovedadLanzamientosUseCase {
  constructor(
    @Inject(NOVEDAD_REPOSITORY)
    private readonly novedadRepository: INovedadRepository,
  ) {}

  async execute(params: ListarNovedadLanzamientosParams) {
    return await this.novedadRepository.listarLanzamientos(params);
  }
}
