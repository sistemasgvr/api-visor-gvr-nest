export class GuardarRecursoDto {
  recurso_tipo: string;

  recurso_id: string;

  recurso_urn?: string;

  project_id?: string;

  parent_id?: string;

  idusuario_creador: number;

  idusuario_asignado?: number;

  nombre?: string;

  descripcion?: string;

  estado?: string;

  metadatos?: any;
}
