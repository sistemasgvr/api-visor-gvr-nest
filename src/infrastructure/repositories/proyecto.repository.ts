import { Injectable } from '@nestjs/common';
import type {
    IProyectoRepository,
    ListarProyectosParams,
    ListarProyectosResponse,
    CrearProyectoData,
    EditarProyectoData,
    ListarUsuariosDisponiblesParams,
    CrearDocumentoProyectoData,
    ActualizarDocumentoProyectoData,
} from '../../domain/repositories/proyecto.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';

@Injectable()
export class ProyectoRepository implements IProyectoRepository {
    constructor(
        private readonly databaseFunctionService: DatabaseFunctionService,
    ) { }

    async listarProyectos(params: ListarProyectosParams): Promise<ListarProyectosResponse> {
        const { idUsuario, idTipoProyecto = null, idPais = null, idCliente = null, busqueda = '', limit = 10, offset = 0 } = params;

        const result = await this.databaseFunctionService.callFunction<any>(
            'proListarProyectos',
            [idUsuario, idTipoProyecto, idPais, idCliente, busqueda, limit, offset],
        );

        if (!result || result.length === 0) {
            return {
                data: [],
                pagination: {
                    total: 0,
                    limit,
                    offset,
                    total_pages: 0,
                    current_page: 1,
                },
            };
        }

        const totalRegistros = result[0]?.total_registros || 0;

        return {
            data: result,
            pagination: {
                total: totalRegistros,
                limit,
                offset,
                total_pages: limit > 0 ? Math.ceil(totalRegistros / limit) : 0,
                current_page: limit > 0 ? Math.floor(offset / limit) + 1 : 1,
            },
        };
    }

    async obtenerProyectoPorId(idProyecto: number): Promise<any> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'proObtenerProyectoPorId',
            [idProyecto],
        );

        return result;
    }

    async crearProyecto(data: CrearProyectoData): Promise<any> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'proCrearProyecto',
            [
                data.nombreProyecto,
                data.nroProyecto,
                data.idTipoProyecto,
                data.idPais,
                data.direccion1 || null,
                data.direccion2 || null,
                data.ciudad || null,
                data.provincia || null,
                data.codigoPostal || null,
                data.idZonaHoraria || null,
                data.fechaInicio || null,
                data.fechaFinalizacion || null,
                data.valorProyecto || null,
                data.idTipoMoneda || null,
                data.diaValorizar ?? null,
                data.idCliente ?? null,
                data.observaciones || null,
                data.idModalidad ?? null,
                data.idEstadoProyecto ?? null,
                data.idEstadoCotizacion ?? null,
                data.idUsuarioCreacion,
                data.idCoordinador ?? null,
            ],
        );

        return result;
    }

    async editarProyecto(data: EditarProyectoData): Promise<any> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'proEditarProyecto',
            [
                data.idProyecto,
                data.nombreProyecto,
                data.nroProyecto,
                data.idTipoProyecto,
                data.idPais,
                data.direccion1 || null,
                data.direccion2 || null,
                data.ciudad || null,
                data.provincia || null,
                data.codigoPostal || null,
                data.idZonaHoraria || null,
                data.fechaInicio || null,
                data.fechaFinalizacion || null,
                data.valorProyecto || null,
                data.idTipoMoneda || null,
                data.diaValorizar ?? null,
                data.idCliente ?? null,
                data.observaciones || null,
                data.idModalidad ?? null,
                data.idEstadoProyecto ?? null,
                data.idEstadoCotizacion ?? null,
                data.idUsuarioModificacion,
                data.idCoordinador ?? null,
            ],
        );

        return result;
    }

    async eliminarProyecto(idProyecto: number, idUsuarioModificacion: number): Promise<any> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'proEliminarProyecto',
            [idProyecto, idUsuarioModificacion],
        );

        return result;
    }

    async listarUsuariosProyecto(idProyecto: number): Promise<any[]> {
        const result = await this.databaseFunctionService.callFunction<any>(
            'proListarUsuariosProyecto',
            [idProyecto],
        );
        return result ?? [];
    }

    async asignarAccesoProyecto(
        idProyecto: number,
        idUsuario: number,
        idNivelAcceso: number | null,
        idUsuarioCreacion: number,
    ): Promise<{ success: boolean; message: string; id?: number }> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'proAsignarAccesoProyecto',
            [idProyecto, idUsuario, idNivelAcceso, idUsuarioCreacion],
        );
        return result;
    }

    async actualizarNivelAccesoProyecto(
        idAcceso: number,
        idNivelAcceso: number,
        idUsuarioModificacion: number,
    ): Promise<{ success: boolean; message: string }> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'proActualizarNivelAccesoProyecto',
            [idAcceso, idNivelAcceso, idUsuarioModificacion],
        );
        return result;
    }

    async removerAccesoProyecto(idAcceso: number, idUsuarioModificacion: number): Promise<{ success: boolean; message: string }> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'proRemoverAccesoProyecto',
            [idAcceso, idUsuarioModificacion],
        );
        return result;
    }

    async listarUsuariosDisponiblesProyecto(params: ListarUsuariosDisponiblesParams): Promise<{ data: any[]; total: number }> {
        const { idProyecto, busqueda = '', limit = 50, offset = 0, idRol = null } = params;
        const result = await this.databaseFunctionService.callFunction<any>(
            'proListarUsuariosDisponiblesProyecto',
            [idProyecto, busqueda, limit, offset, idRol],
        );
        const total = result?.[0]?.total_registros ?? 0;
        return { data: result ?? [], total: Number(total) };
    }

    async listarDocumentosProyecto(idProyecto: number): Promise<any[]> {
        const result = await this.databaseFunctionService.callFunction<any>(
            'proListarDocumentosProyecto',
            [idProyecto],
        );
        return result ?? [];
    }

    async crearDocumentoProyecto(
        idProyecto: number,
        data: CrearDocumentoProyectoData,
        idUsuarioCreacion: number,
    ): Promise<{ success: boolean; message: string; id?: number }> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'proCrearDocumentoProyecto',
            [idProyecto, data.idTipoDocumento, data.nombre, data.linkDocumento ?? null, idUsuarioCreacion],
        );
        return result;
    }

    async actualizarDocumentoProyecto(
        idDocumento: number,
        data: ActualizarDocumentoProyectoData,
        idUsuarioModificacion: number,
    ): Promise<{ success: boolean; message: string }> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'proActualizarDocumentoProyecto',
            [idDocumento, data.idTipoDocumento, data.nombre, data.linkDocumento ?? null, idUsuarioModificacion],
        );
        return result;
    }

    async eliminarDocumentoProyecto(idDocumento: number, idUsuarioModificacion: number): Promise<{ success: boolean; message: string }> {
        const result = await this.databaseFunctionService.callFunctionSingle<any>(
            'proEliminarDocumentoProyecto',
            [idDocumento, idUsuarioModificacion],
        );
        return result;
    }
}
