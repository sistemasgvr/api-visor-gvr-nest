export enum TipoReporte {
  DETALLE_INCIDENCIA = 'issue_detail',
  RESUMEN_INCIDENCIAS = 'issue_summary',
  INCIDENCIAS_EN_PLANOS = 'issues_on_plans',
}

export enum FormatoExportacion {
  PDF = 'pdf',
  BCF = 'bcf',
}

export class ExportarIncidenciasDto {
  issueId?: string; // Para detalle de incidencia

  tipoReporte: TipoReporte;

  formato: FormatoExportacion;

  titulo?: string;

  guardarEnArchivos?: boolean;

  diseño?: string;

  // Opciones para incluir en el reporte

  incluirCubierta?: boolean;

  incluirIndice?: boolean;

  incluirInformacionGeneralPlano?: boolean;

  incluirCamposPersonalizados?: boolean;

  incluirVinculosArchivo?: boolean;

  incluirFotos?: boolean;

  tamañoFotos?: string;

  incluirOtrasReferencias?: boolean;

  incluirComentarios?: boolean;

  // Para resumen o incidencias en planos

  issueIds?: string[];

  // Filtros para exportar múltiples incidencias

  filter_status?: string;

  filter_linkedDocumentUrn?: string;

  // Información del usuario de la sesión

  usuarioNombre?: string;

  usuarioEmail?: string;
}
