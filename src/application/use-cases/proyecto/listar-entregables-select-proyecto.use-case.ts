import { Injectable, Inject } from '@nestjs/common';
import {
  PROYECTO_REPOSITORY,
  type EntregableSelectOption,
  type IProyectoRepository,
} from '../../../domain/repositories/proyecto.repository.interface';

@Injectable()
export class ListarEntregablesSelectProyectoUseCase {
  constructor(
    @Inject(PROYECTO_REPOSITORY)
    private readonly proyectoRepository: IProyectoRepository,
  ) {}

  async execute(idProyecto: number): Promise<EntregableSelectOption[]> {
    if (idProyecto == null || idProyecto < 1) return [];
    return this.proyectoRepository.listarEntregablesParaSelect(idProyecto);
  }
}
