export class DocStatusDto {
  idArchivo!: number;

  estado!: string;
}

export class EnviarResenaPasoDto {
  notas?: string;

  docStatuses?: DocStatusDto[];
}
