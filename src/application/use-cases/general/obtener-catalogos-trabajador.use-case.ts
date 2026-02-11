import { Injectable, Inject } from '@nestjs/common';
import type { IMenuRepository } from '../../../domain/repositories/menu.repository.interface';
import { MENU_REPOSITORY } from '../../../domain/repositories/menu.repository.interface';

/** IDs de listas en genListado (seeds: Grado=8, Carrera=9, EntidadBancaria=10, TipoContrato=11, DuracionContrato=12) */
const ID_LISTA_GRADO_INSTRUCCION = 8;
const ID_LISTA_CARRERA = 9;
const ID_LISTA_ENTIDAD_BANCARIA = 10;
const ID_LISTA_TIPO_CONTRATO = 11;
const ID_LISTA_DURACION_CONTRATO = 12;

export interface CatalogosTrabajador {
    gradoInstruccion: any[];
    carrera: any[];
    entidadBancaria: any[];
    tipoContrato: any[];
    duracionContrato: any[];
}

@Injectable()
export class ObtenerCatalogosTrabajadorUseCase {
    constructor(
        @Inject(MENU_REPOSITORY)
        private readonly menuRepository: IMenuRepository,
    ) {}

    async execute(): Promise<CatalogosTrabajador> {
        const [gradoInstruccion, carrera, entidadBancaria, tipoContrato, duracionContrato] =
            await Promise.all([
                this.menuRepository.obtenerOpcionesPorLista(ID_LISTA_GRADO_INSTRUCCION),
                this.menuRepository.obtenerOpcionesPorLista(ID_LISTA_CARRERA),
                this.menuRepository.obtenerOpcionesPorLista(ID_LISTA_ENTIDAD_BANCARIA),
                this.menuRepository.obtenerOpcionesPorLista(ID_LISTA_TIPO_CONTRATO),
                this.menuRepository.obtenerOpcionesPorLista(ID_LISTA_DURACION_CONTRATO),
            ]);

        return {
            gradoInstruccion: gradoInstruccion || [],
            carrera: carrera || [],
            entidadBancaria: entidadBancaria || [],
            tipoContrato: tipoContrato || [],
            duracionContrato: duracionContrato || [],
        };
    }
}
