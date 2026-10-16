/** Prefijo lógico (carpetas virtuales), sin barra inicial. Ej: `documentos/facturas`. */
export class UploadPrefixedDto {
  prefix: string;

  filename?: string;
}
