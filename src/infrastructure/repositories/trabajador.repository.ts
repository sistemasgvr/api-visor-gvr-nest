import { Injectable } from '@nestjs/common';
import type {
  ITrabajadorRepository,
  ListarTrabajadoresParams,
  ListarTrabajadoresResponse,
  CrearTrabajadorData,
  EditarTrabajadorData,
} from '../../domain/repositories/trabajador.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';

@Injectable()
export class TrabajadorRepository implements ITrabajadorRepository {
  constructor(
    private readonly databaseFunctionService: DatabaseFunctionService,
  ) {}

  async listarTrabajadores(
    params: ListarTrabajadoresParams,
  ): Promise<ListarTrabajadoresResponse> {
    const {
      idUsuario,
      idEmpresa = null,
      busqueda = '',
      limit = 10,
      offset = 0,
      idRol = null,
    } = params;
    // estado: -1 = todos, 0 = inactivos, 1 = activos (default), undefined = activos
    const estadoParam =
      params.estado === -1
        ? null
        : params.estado !== undefined
          ? params.estado
          : 1;

    const result = await this.databaseFunctionService.callFunction<any>(
      'tra_ListarTrabajadores',
      [idUsuario, idEmpresa, busqueda, limit, offset, idRol, estadoParam],
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

    // Extract total from first element
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

  async listarTrabajadoresAdministrativos(): Promise<any[]> {
    // Call traListarTrabajadoresAdministrativos (otro archivo SQL)
    const result = await this.databaseFunctionService.callFunction<any>(
      'tra_ListarTrabajadoresAdministrativos',
      [],
    );

    if (!result || result.length === 0) {
      return [];
    }

    // Decode JSON fields
    return result.map((admin) => {
      if (admin.roles && typeof admin.roles === 'string') {
        try {
          admin.roles = JSON.parse(admin.roles);
        } catch (e) {
          admin.roles = [];
        }
      }
      if (admin.permisos && typeof admin.permisos === 'string') {
        try {
          admin.permisos = JSON.parse(admin.permisos);
        } catch (e) {
          admin.permisos = [];
        }
      }
      return admin;
    });
  }

  async obtenerTrabajadorPorId(idTrabajador: number): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'tra_ObtenerTrabajadorPorId',
      [idTrabajador],
    );

    if (!result) {
      return null;
    }

    if (result.roles && typeof result.roles === 'string') {
      try {
        result.roles = JSON.parse(result.roles);
      } catch (e) {
        result.roles = [];
      }
    }

    // Fallback: si la función no devolvió descripciones (JOIN sin match), resolver por id
    if (result.idtipodocumento != null && result.tipodocumento == null) {
      const opt = await this.databaseFunctionService.executeQuery<{
        label: string;
      }>(
        'SELECT COALESCE(descripcion, nombre) AS label FROM genlistadoopciones WHERE id = $1',
        [result.idtipodocumento],
      );
      if (opt?.length) result.tipodocumento = opt[0].label;
    }
    if (
      result.idempresa != null &&
      result.nombreempresa == null &&
      result.razonsocialempresa
    ) {
      result.nombreempresa = result.razonsocialempresa;
    }

    return result;
  }

  async crearTrabajador(data: CrearTrabajadorData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'tra_CrearTrabajador',
      [
        data.nombres,
        data.apellidos,
        data.idTipoDocumento,
        data.nroDocumento,
        data.correo,
        data.idEmpresa,
        data.idUsuarioCreacion,
        data.idResponsable ?? null,
        data.idRol ?? null,
        data.fechaNacimiento ?? null,
        data.celular ?? null,
        data.telefonoEmergencia ?? null,
        data.contactoEmergenciaNombre ?? null,
        data.idContactoEmergenciaParentesco ?? null,
        data.direccionDomiciliaria ?? null,
        data.idPais ?? null,
        data.idDepartamento ?? null,
        data.idProvincia ?? null,
        data.idDistrito ?? null,
        data.nroRuc ?? null,
        data.idGradoInstruccion ?? null,
        data.idCarrera ?? null,
        data.idEntidadBancaria ?? null,
        data.nroCuentaCorriente ?? null,
        data.nroCci ?? null,
        data.remuneracion ?? null,
        data.idTipoContrato ?? null,
        data.idDuracionContrato ?? null,
        data.fechaInicioLabores ?? null,
        data.fechaInicioContrato ?? null,
        data.fechaFinContrato ?? null,
        data.idModalidad ?? null,
      ],
    );

    return result;
  }

  async editarTrabajador(data: EditarTrabajadorData): Promise<any> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'tra_EditarTrabajador',
      [
        data.idTrabajador,
        data.nombres,
        data.apellidos,
        data.idTipoDocumento,
        data.nroDocumento,
        data.correo,
        data.idEmpresa,
        data.idUsuarioModificacion,
        data.idResponsable ?? null,
        data.idRol ?? null,
        data.fechaNacimiento ?? null,
        data.celular ?? null,
        data.telefonoEmergencia ?? null,
        data.contactoEmergenciaNombre ?? null,
        data.idContactoEmergenciaParentesco ?? null,
        data.direccionDomiciliaria ?? null,
        data.idPais ?? null,
        data.idDepartamento ?? null,
        data.idProvincia ?? null,
        data.idDistrito ?? null,
        data.nroRuc ?? null,
        data.idGradoInstruccion ?? null,
        data.idCarrera ?? null,
        data.idEntidadBancaria ?? null,
        data.nroCuentaCorriente ?? null,
        data.nroCci ?? null,
        data.remuneracion ?? null,
        data.idTipoContrato ?? null,
        data.idDuracionContrato ?? null,
        data.fechaInicioLabores ?? null,
        data.fechaInicioContrato ?? null,
        data.fechaFinContrato ?? null,
        data.idModalidad ?? null,
      ],
    );

    return result;
  }

  async eliminarAdjuntosPorTrabajador(idTrabajador: number): Promise<void> {
    await this.databaseFunctionService.callFunction(
      'tra_EliminarAdjuntosPorTrabajador',
      [idTrabajador],
    );
  }

  async insertarAdjuntos(
    idTrabajador: number,
    adjuntos: { idTipoAdjunto: number; ruta: string }[],
    idUsuarioCreacion?: number,
  ): Promise<void> {
    if (!adjuntos?.length) return;
    const filtered = adjuntos.filter(
      (a) =>
        a != null &&
        Number(a.idTipoAdjunto) > 0 &&
        a.ruta != null &&
        String(a.ruta).trim() !== '',
    );
    if (filtered.length === 0) return;
    await this.databaseFunctionService.callFunction('tra_InsertarAdjuntos', [
      idTrabajador,
      JSON.stringify(filtered),
      idUsuarioCreacion ?? null,
    ]);
  }

  async eliminarTrabajador(
    idTrabajador: number,
    idUsuarioModificacion: number,
  ): Promise<any> {
    // tra_EliminarTrabajador
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'tra_EliminarTrabajador',
      [idTrabajador, idUsuarioModificacion],
    );

    return result;
  }

  async resetearContrasena(
    idTrabajador: number,
    idUsuarioModificacion: number,
  ): Promise<any> {
    // tra_ResetearContrasena
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'tra_ResetearContrasena',
      [idTrabajador, idUsuarioModificacion],
    );

    return result;
  }
}
