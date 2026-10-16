export class NamingStandardPartDto {
  attributeId: number;

  orden: number;
}

export class UpsertDocumentNamingStandardDto {
  id?: number;

  codigo: string;

  nombre: string;

  descripcion?: string;

  separador?: string;

  partes?: NamingStandardPartDto[];
}
