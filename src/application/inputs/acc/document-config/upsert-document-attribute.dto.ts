export class DocumentAttributeOptionDto {
  valor: string;

  etiqueta?: string;

  orden?: number;
}

export class UpsertDocumentAttributeDto {
  id?: number;

  codigo: string;

  nombre: string;

  tipo: string;

  descripcion?: string;

  esObligatorio?: boolean;

  orden?: number;

  opciones?: DocumentAttributeOptionDto[];
}
