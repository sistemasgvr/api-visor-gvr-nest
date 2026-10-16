/** Contrato de integración limitado a la capacidad Compatibility. */
export interface AutodeskCompatibilityPort {
  crearRevision(
    accessToken: string,
    projectId: string,
    data: Record<string, any>,
  ): Promise<any>;
  exportarIncidencias(
    accessToken: string,
    projectId: string,
    dto: any,
  ): Promise<any>;
  finalizarUploadS3(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
    uploadKey: string,
  ): Promise<any>;
  obtenerRevisiones(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerStorageUrlPorVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<{
    storageUrl: string;
    fileName: string;
    fileType: string;
    storageId: string;
    itemId: string;
  }>;
  obtenerUrlFirmadaS3Upload(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
  ): Promise<any>;
  obtenerWorkflows(
    accessToken: string,
    projectId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  subirArchivoS3(
    uploadUrl: string,
    content: Buffer | string,
    contentType: string,
  ): Promise<any>;
}
