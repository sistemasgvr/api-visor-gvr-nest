import { Injectable, Inject } from '@nestjs/common';
import type { IMenuRepository } from '../../../domain/repositories/menu.repository.interface';
import { MENU_REPOSITORY } from '../../../domain/repositories/menu.repository.interface';

const CLAVES_CATALOGOS_TRABAJADOR_BASE = [
  'gradoInstruccion',
  'carrera',
  'entidadBancaria',
  'tipoContrato',
  'duracionContrato',
  'tipoAdjunto',
  'parentesco',
] as const;

/** genListado.id fijo para opciones de puesto de trabajo (trabajador / contrato). */
const ID_LISTA_PUESTO_TRABAJO = 45;

const DEFAULT_IDS_BASE = [8, 9, 10, 11, 12, 13, 14];

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
   * Catálogos del formulario trabajador. La octava lista es siempre idLista = 45 (puesto de trabajo).
   * Opcional idListas: 7 IDs (base) o 8+ (se toman los 7 primeros como base y el puesto sigue siendo 45).
   */
  async execute(idListas?: number[]): Promise<CatalogosTrabajador> {
    let ids: number[];
    if (idListas != null && idListas.length > 0) {
      if (idListas.length >= 8) {
        ids = [...idListas.slice(0, 7), ID_LISTA_PUESTO_TRABAJO];
      } else if (idListas.length === 7) {
        ids = [...idListas, ID_LISTA_PUESTO_TRABAJO];
      } else {
        ids = [...DEFAULT_IDS_BASE, ID_LISTA_PUESTO_TRABAJO];
      }
    } else {
      ids = [...DEFAULT_IDS_BASE, ID_LISTA_PUESTO_TRABAJO];
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
