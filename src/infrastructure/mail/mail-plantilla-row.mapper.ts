import type {
  MailPlantillaCorreoDetalle,
  MailPlantillaCorreoHistorialDetalle,
  MailPlantillaCorreoHistorialItem,
  MailPlantillaCorreoListItem,
  MailPlantillaCorreoSlugRow,
  MailTemplateVariableSchemaItem,
} from '../../domain/entities/mail-plantilla-correo.entity';

function pick<T>(row: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null) {
      return value as T;
    }
  }
  return undefined;
}

function parseJsonObject(
  value: unknown,
): Record<string, unknown> | null {
  if (value == null) return null;
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  return null;
}

function parseVariables(value: unknown): MailTemplateVariableSchemaItem[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value as MailTemplateVariableSchemaItem[];
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as MailTemplateVariableSchemaItem[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function mapMailPlantillaListRow(
  row: Record<string, unknown>,
): MailPlantillaCorreoListItem {
  return {
    id: Number(pick(row, 'id')),
    slug: String(pick(row, 'slug') ?? ''),
    nombre: String(pick(row, 'nombre') ?? ''),
    descripcion: (pick<string>(row, 'descripcion') ?? null) as string | null,
    asuntoPlantilla: String(
      pick(row, 'asuntoplantilla', 'asuntoPlantilla') ?? '',
    ),
    claveLayout: String(pick(row, 'clavelayout', 'claveLayout') ?? 'base'),
    esSistema: Boolean(pick(row, 'essistema', 'esSistema')),
    numeroVersion: Number(pick(row, 'numeroversion', 'numeroVersion') ?? 1),
    estado: Number(pick(row, 'estado') ?? 0),
    tieneMjml: Boolean(pick(row, 'tieneMjml', 'tiene_mjml')),
    tieneHtml: Boolean(pick(row, 'tieneHtml', 'tiene_html')),
    tieneDesignJson: Boolean(
      pick(row, 'tieneDesignJson', 'tiene_design_json'),
    ),
    cantidadVariables: Number(
      pick(row, 'cantidadvariables', 'cantidadVariables') ?? 0,
    ),
    fechaCreacion: pick(row, 'fechacreacion', 'fechaCreacion') as
      | Date
      | string,
    fechaModificacion: pick(row, 'fechamodificacion', 'fechaModificacion') as
      | Date
      | string,
    idUsuarioCreacion: pick<number>(row, 'idusuariocreacion', 'idUsuarioCreacion') ?? null,
    nombreUsuarioCreacion:
      (pick<string>(row, 'nombreusuariocreacion', 'nombreUsuarioCreacion') ??
        null) as string | null,
    idUsuarioModificacion:
      pick<number>(row, 'idusuariomodificacion', 'idUsuarioModificacion') ??
      null,
    nombreUsuarioModificacion:
      (pick<string>(
        row,
        'nombreusuariomodificacion',
        'nombreUsuarioModificacion',
      ) ?? null) as string | null,
  };
}

export function mapMailPlantillaDetalleRow(
  row: Record<string, unknown>,
): MailPlantillaCorreoDetalle {
  const base = mapMailPlantillaListRow(row);
  return {
    ...base,
    cuerpoMjml: (pick<string>(row, 'cuerpomjml', 'cuerpoMjml') ?? null) as
      | string
      | null,
    cuerpoHtml: (pick<string>(row, 'cuerpohtml', 'cuerpoHtml') ?? null) as
      | string
      | null,
    designJson: parseJsonObject(pick(row, 'designjson', 'designJson')),
    esquemaVariables: parseVariables(
      pick(row, 'esquemavariables', 'esquemaVariables'),
    ),
    variablesPrueba:
      parseJsonObject(pick(row, 'variablesprueba', 'variablesPrueba')) ?? {},
  };
}

export function mapMailPlantillaSlugRow(
  row: Record<string, unknown>,
): MailPlantillaCorreoSlugRow {
  const detalle = mapMailPlantillaDetalleRow(row);
  return {
    id: detalle.id,
    slug: detalle.slug,
    nombre: detalle.nombre,
    descripcion: detalle.descripcion,
    asuntoPlantilla: detalle.asuntoPlantilla,
    cuerpoMjml: detalle.cuerpoMjml,
    cuerpoHtml: detalle.cuerpoHtml,
    designJson: detalle.designJson,
    esquemaVariables: detalle.esquemaVariables,
    variablesPrueba: detalle.variablesPrueba,
    claveLayout: detalle.claveLayout,
    esSistema: detalle.esSistema,
    numeroVersion: detalle.numeroVersion,
    estado: detalle.estado,
    fechaModificacion: detalle.fechaModificacion,
  };
}

export function mapMailPlantillaHistorialRow(
  row: Record<string, unknown>,
): MailPlantillaCorreoHistorialItem {
  return {
    id: Number(pick(row, 'id')),
    idPlantillaCorreo: Number(
      pick(row, 'idplantillacorreo', 'idPlantillaCorreo'),
    ),
    numeroVersion: Number(pick(row, 'numeroversion', 'numeroVersion') ?? 1),
    asuntoPlantilla: String(
      pick(row, 'asuntoplantilla', 'asuntoPlantilla') ?? '',
    ),
    tieneMjml: Boolean(pick(row, 'tieneMjml', 'tiene_mjml')),
    tieneHtml: Boolean(pick(row, 'tieneHtml', 'tiene_html')),
    cantidadVariables: Number(
      pick(row, 'cantidadvariables', 'cantidadVariables') ?? 0,
    ),
    claveLayout: String(pick(row, 'clavelayout', 'claveLayout') ?? 'base'),
    idUsuarioModificacion:
      pick<number>(row, 'idusuariomodificacion', 'idUsuarioModificacion') ??
      null,
    nombreUsuarioModificacion:
      (pick<string>(
        row,
        'nombreusuariomodificacion',
        'nombreUsuarioModificacion',
      ) ?? null) as string | null,
    fechaCreacion: pick(row, 'fechacreacion', 'fechaCreacion') as Date | string,
  };
}

export function mapMailPlantillaHistorialDetalleRow(
  row: Record<string, unknown>,
): MailPlantillaCorreoHistorialDetalle {
  const base = mapMailPlantillaHistorialRow(row);
  return {
    ...base,
    cuerpoMjml: (pick<string>(row, 'cuerpomjml', 'cuerpoMjml') ?? null) as
      | string
      | null,
    cuerpoHtml: (pick<string>(row, 'cuerpohtml', 'cuerpoHtml') ?? null) as
      | string
      | null,
    designJson: parseJsonObject(pick(row, 'designjson', 'designJson')),
    esquemaVariables: parseVariables(
      pick(row, 'esquemavariables', 'esquemaVariables'),
    ),
    variablesPrueba:
      parseJsonObject(pick(row, 'variablesprueba', 'variablesPrueba')) ?? {},
  };
}

export function mapSqlMutationRow(
  row: Record<string, unknown> | null | undefined,
): { success: boolean; message: string; id_plantilla?: number; numeroVersion?: number } {
  if (!row) {
    return { success: false, message: 'Sin respuesta de la base de datos' };
  }
  return {
    success: Boolean(pick(row, 'success')),
    message: String(pick(row, 'message') ?? ''),
    id_plantilla: pick<number>(row, 'id_plantilla', 'idPlantilla'),
    numeroVersion: pick<number>(
      row,
      'nuevaversion',
      'nuevaVersion',
      'numeroversion',
      'numeroVersion',
    ),
  };
}
