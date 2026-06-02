import { Injectable, Inject } from '@nestjs/common';
import type {
  IProyectoRepository,
  ListarEntregablesProyectoParams,
} from '../../../domain/repositories/proyecto.repository.interface';
import { PROYECTO_REPOSITORY } from '../../../domain/repositories/proyecto.repository.interface';

@Injectable()
export class ListarEntregablesProyectoUseCase {
  constructor(
    @Inject(PROYECTO_REPOSITORY)
    private readonly proyectoRepository: IProyectoRepository,
  ) {}

  async execute(params: ListarEntregablesProyectoParams) {
    return this.proyectoRepository.listarEntregablesProyecto(params);
  }
}
