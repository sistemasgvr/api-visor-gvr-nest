/** Contrato de integración limitado a la capacidad Reviews. */
export interface AutodeskReviewsPort {
  crearWorkflow(
    accessToken: string,
    projectId: string,
    data: Record<string, any>,
  ): Promise<any>;
  obtenerApprovalStatusesVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerPerfilUsuarioAcc(accessToken: string): Promise<{
    userId: string;
    userName: string;
    emailId: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    profileImages?: any;
  }>;
  obtenerProgresoRevision(
    accessToken: string,
    projectId: string,
    reviewId: string,
  ): Promise<any>;
  obtenerRevisionPorId(
    accessToken: string,
    projectId: string,
    reviewId: string,
  ): Promise<any>;
  obtenerVersionPorId(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any>;
  obtenerVersionesRevision(
    accessToken: string,
    projectId: string,
    reviewId: string,
  ): Promise<any>;
  obtenerWorkflowPorId(
    accessToken: string,
    projectId: string,
    workflowId: string,
  ): Promise<any>;
  obtenerWorkflowRevision(
    accessToken: string,
    projectId: string,
    reviewId: string,
  ): Promise<any>;
}
