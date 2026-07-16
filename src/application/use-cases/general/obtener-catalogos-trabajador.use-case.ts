import { Injectable, Inject } from '@nestjs/common';
import type { IMenuRepository } from '../../../domain/repositories/menu.repository.interface';
import { MENU_REPOSITORY } from '../../../domain/repositories/menu.repository.interface';
import {
  ID_LISTA_PUESTO_TRABAJO,
  ID_LISTAS_CATALOGOS_TRABAJADOR_BASE,
} from '../../../domain/constants/gen-listado.constants';

const CLAVES_CATALOGOS_TRABAJADOR_BASE = [
  'gradoInstruccion',
  'carrera',
  'entidadBancaria',
  'tipoContrato',
  'duracionContrato',
  'tipoAdjunto',
  'parentesco',
] as const;

const CLAVES_CATALOGOS_TRABAJADOR: readonly string[] = [
  ...CLAVES_CATALOGOS_TRABAJADOR_BASE,
  'puestoTrabajo',
];

export interface CatalogosTrabajador {
  gradoInstruccion: any[];
  carrera: any[];
  entidadBancaria: any[];
  tipoContrato: any[];
  duracionContrato: any[];
  tipoAdjunto: any[];
  parentesco: any[];
  puestoTrabajo: any[];
}

@Injectable()
export class ObtenerCatalogosTrabajadorUseCase {
  constructor(
    @Inject(MENU_REPOSITORY)
    private readonly menuRepository: IMenuRepository,
  ) {}

  /**
   * Catálogos del formulario trabajador. La octava lista es siempre puesto de trabajo.
   * Opcional idListas: 7 IDs (base) o 8+ (se toman los 7 primeros como base y el puesto sigue fijo).
   */
  async execute(idListas?: number[]): Promise<CatalogosTrabajador> {
    let ids: number[];
    if (idListas != null && idListas.length > 0) {
      if (idListas.length >= 8) {
        ids = [...idListas.slice(0, 7), ID_LISTA_PUESTO_TRABAJO];
      } else if (idListas.length === 7) {
        ids = [...idListas, ID_LISTA_PUESTO_TRABAJO];
      } else {
        ids = [...ID_LISTAS_CATALOGOS_TRABAJADOR_BASE, ID_LISTA_PUESTO_TRABAJO];
      }
    } else {
      ids = [...ID_LISTAS_CATALOGOS_TRABAJADOR_BASE, ID_LISTA_PUESTO_TRABAJO];
    }

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
      puestoTrabajo: [],
    };

    CLAVES_CATALOGOS_TRABAJADOR.forEach((key, i) => {
      (out as unknown as Record<string, unknown>)[key] = resultados[i] ?? [];
    });
    return out;
  }
}
