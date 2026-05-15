import { Injectable } from '@nestjs/common';
import type {
  ITrabajadorRepository,
  ListarTrabajadoresParams,
  ListarTrabajadoresResponse,
  CrearTrabajadorData,
  EditarTrabajadorData,
  ActualizarContratoTrabajadorData,
  InsertarContratoTrabajadorData,
  EliminarContratoTrabajadorData,
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

  async obtenerUrlAlmacenadaFotoPerfilPorIdTrabajador(
    idTrabajador: number,
  ): Promise<{ url: string | null } | null> {
    if (idTrabajador == null || idTrabajador < 1) {
      return null;
    }
    const rows = await this.databaseFunctionService.executeQuery<{
      url: string | null;
    }>(
      `SELECT g.url AS url
       FROM tratrabajador t
       INNER JOIN authusuarios u ON u.id = t.idusuario AND u.estado = 1
       LEFT JOIN genarchivo g ON g.id = u.idarchivofotoperfil AND g.estado = 1
       WHERE t.id = $1 AND t.estado = 1
       LIMIT 1`,
      [idTrabajador],
    );
    if (!rows?.length) {
      return null;
    }
    const url = rows[0]?.url;
    return {
      url: url != null && String(url).trim() !== '' ? String(url).trim() : null,
    };
  }

  async obtenerIdTrabajadorActivoPorIdUsuario(
    idUsuario: number,
  ): Promise<number | null> {
    if (idUsuario == null || idUsuario < 1) {
      return null;
    }
    const rows = await this.databaseFunctionService.executeQuery<{
      id: number;
    }>(
      `SELECT t.id
       FROM tratrabajador t
       WHERE t.idusuario = $1 AND t.estado = 1
       LIMIT 1`,
      [idUsuario],
    );
    const id = rows?.[0]?.id;
    return id != null && Number(id) > 0 ? Number(id) : null;
  }

  async obtenerUrlAlmacenadaFirmaPorIdTrabajador(
    idTrabajador: number,
  ): Promise<{ url: string | null } | null> {
    if (idTrabajador == null || idTrabajador < 1) {
      return null;
    }
    const rows = await this.databaseFunctionService.executeQuery<{
      url: string | null;
    }>(
      `SELECT g.url AS url
       FROM tratrabajador t
       LEFT JOIN genarchivo g ON g.id = t.idarchivofirma AND g.estado = 1
       WHERE t.id = $1 AND t.estado = 1
       LIMIT 1`,
      [idTrabajador],
    );
    if (!rows?.length) {
      return null;
    }
    const url = rows[0]?.url;
    return {
      url: url != null && String(url).trim() !== '' ? String(url).trim() : null,
    };
  }

  async actualizarFirmaTrabajador(
    idTrabajador: number,
    urlFirma: string,
    idUsuarioModificacion: number,
    nombreOriginal?: string | null,
    tipoMime?: string | null,
    tamanoBytes?: number | null,
  ): Promise<{ urlFirma: string }> {
    const result = await this.databaseFunctionService.callFunctionSingle<any>(
      'tra_ActualizarFirmaTrabajador',
      [
        idTrabajador,
        urlFirma,
        nombreOriginal ?? null,
        tipoMime ?? null,
        tamanoBytes ?? null,
        idUsuarioModificacion,
      ],
    );

    if (!result) {
      throw new Error('No se pudo actualizar la firma del trabajador');
    }

    const path = result.urlfirma ?? result.urlFirma ?? urlFirma;
    return { urlFirma: path };
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

    if (result.contratos && typeof result.contratos === 'string') {
      try {
        result.contratos = JSON.parse(result.contratos);
      } catch (e) {
        result.contratos = [];
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

  async actualizarContratoTrabajador(
    data: ActualizarContratoTrabajadorData,
  ): Promise<any> {
    return await this.databaseFunctionService.callFunctionSingle<any>(
      'tra_ActualizarContratoTrabajador',
      [
        data.idContrato,
        data.idTrabajador,
        data.idUsuarioModificacion,
        data.idTipoContrato ?? null,
        data.idDuracionContrato ?? null,
        data.fechaInicio ?? null,
        data.fechaFin ?? null,
        data.remuneracion ?? null,
        data.fechaInicioLabores ?? null,
        data.idPuestoTrabajo ?? null,
      ],
    );
  }

  async insertarContratoTrabajador(
    data: InsertarContratoTrabajadorData,
  ): Promise<any> {
    return await this.databaseFunctionService.callFunctionSingle<any>(
      'tra_InsertarContratoTrabajador',
      [
        data.idTrabajador,
        data.idUsuarioCreacion,
        data.idTipoContrato,
        data.idDuracionContrato ?? null,
        data.fechaInicio ?? null,
        data.fechaFin ?? null,
        data.remuneracion ?? null,
        data.fechaInicioLabores ?? null,
        data.idPuestoTrabajo ?? null,
      ],
    );
  }

  async eliminarContratoTrabajador(
    data: EliminarContratoTrabajadorData,
  ): Promise<any> {
    return await this.databaseFunctionService.callFunctionSingle<any>(
      'tra_EliminarContratoTrabajador',
      [
        data.idContrato,
        data.idTrabajador,
        data.idUsuarioModificacion,
      ],
    );
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
        data.idPuestoTrabajo ?? null,
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
        data.idPuestoTrabajo ?? null,
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
