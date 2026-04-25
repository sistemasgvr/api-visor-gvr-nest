import { Injectable, Inject } from '@nestjs/common';
import type { IMenuRepository } from '../../../domain/repositories/menu.repository.interface';
import { MENU_REPOSITORY } from '../../../domain/repositories/menu.repository.interface';

/** Claves de respuesta por posición (orden enviado por frontend: grado, carrera, entidad, tipoContrato, duracion, tipoAdjunto, parentesco) */
const CLAVES_CATALOGOS_TRABAJADOR = [
  'gradoInstruccion',
  'carrera',
  'entidadBancaria',
  'tipoContrato',
  'duracionContrato',
  'tipoAdjunto',
  'parentesco',
] as const;

export interface CatalogosTrabajador {
  gradoInstruccion: any[];
  carrera: any[];
  entidadBancaria: any[];
  tipoContrato: any[];
  duracionContrato: any[];
  tipoAdjunto: any[];
  parentesco: any[];
}

@Injectable()
export class ObtenerCatalogosTrabajadorUseCase {
  constructor(
    @Inject(MENU_REPOSITORY)
    private readonly menuRepository: IMenuRepository,
  ) {}

  /**
   * @param idListas IDs de listas (genListado). Orden: grado, carrera, entidad, tipoContrato, duracion, tipoAdjunto, parentesco.
   *                 Si no se envía, se usa el orden por defecto de CLAVES_CATALOGOS_TRABAJADOR (7 listas).
   */
  async execute(idListas?: number[]): Promise<CatalogosTrabajador> {
    const ids =
      idListas && idListas.length >= CLAVES_CATALOGOS_TRABAJADOR.length
        ? idListas.slice(0, CLAVES_CATALOGOS_TRABAJADOR.length)
        : [8, 9, 10, 11, 12, 13, 14];

    const resultados = await Promise.all(
      ids.map((id) => this.menuRepository.obtenerOpcionesPorLista(id)),
    );

    const out: CatalogosTrabajador = {
      gradoInstruccion: [],
      carrera: [],
      entidadBancaria: [],
      tipoContrato: [],
      duracionContrato: [],
      tipoAdjunto: [],
      parentesco: [],
    };

    CLAVES_CATALOGOS_TRABAJADOR.forEach((key, i) => {
      (out as any)[key] = resultados[i] || [];
    });
    return out;
  }
}
