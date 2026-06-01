export const ACC_DOCUMENT_CONFIG_REPOSITORY = Symbol(
  'ACC_DOCUMENT_CONFIG_REPOSITORY',
);

export interface ListarDocumentAttributesParams {
  projectExternalId: string;
  busqueda?: string;
  limit?: number;
  offset?: number;
}

export interface ListarDocumentAttributesResponse {
  data: any[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
  };
}

export interface UpsertDocumentAttributeData {
  id?: number | null;
  projectExternalId: string;
  codigo: string;
  nombre: string;
  tipo: string;
  descripcion?: string | null;
  esObligatorio?: boolean;
  orden?: number;
  opciones?: Array<{ valor: string; etiqueta?: string; orden?: number }>;
  idUsuario?: number | null;
}

export interface UpsertDocumentNamingStandardData {
  id?: number | null;
  projectExternalId: string;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  separador?: string;
  partes?: Array<{ attributeId: number; orden: number }>;
  idUsuario?: number | null;
}

export interface UpsertFolderNamingRuleData {
  projectExternalId: string;
  folderExternalId: string;
  namingStandardId: number;
  idUsuario?: number | null;
}

export interface CreateNamingStandardFromTemplateData {
  projectExternalId: string;
  templateCode: 'iso19650';
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  separador?: string;
  idUsuario?: number | null;
}

export interface GenerarNombreDocumentoData {
  projectExternalId: string;
  folderExternalId: string;
  valores: Record<string, string>;
  extension?: string;
}

export interface UpsertDocumentMetadataData {
  projectExternalId: string;
  folderExternalId: string;
  itemExternalId: string;
  versionExternalId?: string | null;
  namingStandardId?: number | null;
  nombreGenerado: string;
  valores?: Record<string, unknown>;
  idUsuario?: number | null;
}

export interface IAccDocumentConfigRepository {
  listarAttributes(
    params: ListarDocumentAttributesParams,
  ): Promise<ListarDocumentAttributesResponse>;
  upsertAttribute(data: UpsertDocumentAttributeData): Promise<any>;
  listarNamingStandards(projectExternalId: string): Promise<any>;
  upsertNamingStandard(data: UpsertDocumentNamingStandardData): Promise<any>;
  obtenerFolderNamingRule(
    projectExternalId: string,
    folderExternalId: string,
  ): Promise<any>;
  upsertFolderNamingRule(data: UpsertFolderNamingRuleData): Promise<any>;
  createNamingStandardFromTemplate(
    data: CreateNamingStandardFromTemplateData,
  ): Promise<any>;
  generarNombreDocumento(data: GenerarNombreDocumentoData): Promise<any>;
  upsertMetadata(data: UpsertDocumentMetadataData): Promise<any>;
  obtenerMetadata(
    projectExternalId: string,
    itemExternalId: string,
  ): Promise<any>;
  listarMetadataPorCarpeta(
    projectExternalId: string,
    folderExternalId: string,
  ): Promise<any>;
}
