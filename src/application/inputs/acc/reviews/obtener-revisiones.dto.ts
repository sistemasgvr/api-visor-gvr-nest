export class ObtenerRevisionesDto {
  limit?: number;

  offset?: number;

  sort?: string;

  filter_workflowId?: string;

  filter_status?: string;

  filter_currentStepDueDate?: string;

  filter_createdAt?: string;

  filter_updatedAt?: string;

  filter_finishedAt?: string;

  filter_nextActionByUser?: string;

  filter_nextActionByRole?: string;

  filter_nextActionByCompany?: string;

  filter_name?: string;

  filter_sequenceId?: number;

  filter_archived?: boolean;

  filter_archivedBy?: string;

  filter_archivedAt?: string;
}
