import type {
  MailPlantillaCorreoDetalle,
  MailPlantillaCorreoHistorialDetalle,
  MailPlantillaCorreoHistorialItem,
  MailPlantillaCorreoListItem,
  MailPlantillaCorreoSlugRow,
  MailTemplateVariableSchemaItem,
} from '../entities/mail-plantilla-correo.entity';

export const MAIL_PLANTILLA_CORREO_REPOSITORY = 'MAIL_PLANTILLA_CORREO_REPOSITORY';

export interface ListarMailPlantillasParams {
  busqueda?: string;
  soloActivas?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListarMailPlantillasResponse {
  data: MailPlantillaCorreoListItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
  };
}

export interface CrearMailPlantillaData {
  slug: string;
  nombre: string;
  asuntoPlantilla: string;
  idUsuario: number;
  descripcion?: string | null;
  cuerpoMjml?: string | null;
  cuerpoHtml?: string | null;
  designJson?: Record<string, unknown> | null;
  esquemaVariables?: MailTemplateVariableSchemaItem[];
  variablesPrueba?: Record<string, unknown>;
  claveLayout?: string;
  esSistema?: boolean;
}

export interface ActualizarMailPlantillaData {
  id: number;
  idUsuario: number;
  nombre?: string;
  descripcion?: string | null;
  asuntoPlantilla?: string;
  cuerpoMjml?: string | null;
  cuerpoHtml?: string | null;
  designJson?: Record<string, unknown> | null;
  esquemaVariables?: MailTemplateVariableSchemaItem[];
  variablesPrueba?: Record<string, unknown>;
  claveLayout?: string;
  estado?: number;
}

export interface SqlMutationResult {
  success: boolean;
  message: string;
  id_plantilla?: number;
  numeroVersion?: number;
}

export interface SembrarPlantillaResult {
  slug: string;
  accion: string;
}

export interface IMailPlantillaCorreoRepository {
  listar(params: ListarMailPlantillasParams): Promise<ListarMailPlantillasResponse>;
  obtenerPorId(id: number): Promise<MailPlantillaCorreoDetalle | null>;
  obtenerPorSlug(
    slug: string,
    soloActivas?: boolean,
  ): Promise<MailPlantillaCorreoSlugRow | null>;
  crear(data: CrearMailPlantillaData): Promise<SqlMutationResult>;
  actualizar(data: ActualizarMailPlantillaData): Promise<SqlMutationResult>;
  eliminar(id: number, idUsuario: number): Promise<SqlMutationResult>;
  actualizarVariablesPrueba(
    id: number,
    idUsuario: number,
    variablesPrueba: Record<string, unknown>,
  ): Promise<SqlMutationResult>;
  listarHistorial(
    idPlantilla: number,
    limit?: number,
    offset?: number,
  ): Promise<{
    data: MailPlantillaCorreoHistorialItem[];
    pagination: ListarMailPlantillasResponse['pagination'];
  }>;
  obtenerHistorialPorId(
    idHistorial: number,
  ): Promise<MailPlantillaCorreoHistorialDetalle | null>;
  sembrarPlantillasSistema(
    idUsuario?: number | null,
  ): Promise<SembrarPlantillaResult[]>;
}
