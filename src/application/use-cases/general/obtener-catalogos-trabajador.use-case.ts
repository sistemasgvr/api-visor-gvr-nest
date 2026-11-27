import {
  ID_LISTA_PUESTO_TRABAJO,
  ID_LISTAS_CATALOGOS_TRABAJADOR_BASE,
} from '../../../domain/constants/gen-listado.constants';
import type { IMenuRepository } from '../../../domain/repositories/menu.repository.interface';

const CLAVES_CATALOGOS_TRABAJADOR_BASE = [
  'gradoInstruccion',
  'carrera',
  'entidadBancaria',
  'tipoContrato',
  'duracionContrato',
  'tipoAdjunto',
  'parentesco',
  'areaTrabajador',
] as const;

const CANTIDAD_LISTAS_BASE = CLAVES_CATALOGOS_TRABAJADOR_BASE.length;

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
  areaTrabajador: any[];
  puestoTrabajo: any[];
}

export class ObtenerCatalogosTrabajadorUseCase {
  constructor(private readonly menuRepository: IMenuRepository) {}

  /**
   * Catálogos del formulario trabajador. La última lista es siempre puesto de trabajo.
   * Opcional idListas: 8 IDs (base) o 9+ (se toman los 8 primeros como base y el puesto sigue fijo).
   */
  async execute(idListas?: number[]): Promise<CatalogosTrabajador> {
    let ids: number[];
    if (idListas != null && idListas.length > 0) {
      if (idListas.length > CANTIDAD_LISTAS_BASE) {
        ids = [
          ...idListas.slice(0, CANTIDAD_LISTAS_BASE),
          ID_LISTA_PUESTO_TRABAJO,
        ];
      } else if (idListas.length === CANTIDAD_LISTAS_BASE) {
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
      areaTrabajador: [],
      puestoTrabajo: [],
    };

    CLAVES_CATALOGOS_TRABAJADOR.forEach((key, i) => {
      (out as unknown as Record<string, unknown>)[key] = resultados[i] ?? [];
    });
    return out;
  }
}
