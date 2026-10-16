/** Mismos filtros que GET /reviews; sin paginación (el export recorre todas las páginas). */
export class ExportarRevisionesPdfQueryDto {
  filter_status?: string;

  filter_name?: string;

  filter_createdAt?: string;

  filter_finishedAt?: string;

  filter_currentStepDueDate?: string;

  filter_workflowId?: string;
}
