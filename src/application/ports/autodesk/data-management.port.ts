/** Contrato de integración limitado a la capacidad DataManagement. */
export interface AutodeskDataManagementPort {
  actualizarCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    updateData: any,
  ): Promise<any>;
  actualizarItem(
    accessToken: string,
    projectId: string,
    itemId: string,
    itemData: any,
  ): Promise<any>;
  actualizarVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
    updateData: Record<string, any>,
  ): Promise<any>;
  buscarEnCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  buscarEnContenidoCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    searchName?: string,
    filterType?: string,
    extensionType?: string,
    additionalFilters?: Record<string, any>,
  ): Promise<any>;
  completarSubida(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
    uploadKey: string,
    options?: { eTags?: string[]; size?: number },
  ): Promise<any>;
  copiarItem(
    accessToken: string,
    projectId: string,
    sourceVersionUrn: string,
    targetFolderId: string,
    fileName: string,
  ): Promise<any>;
  crearBucket(
    accessToken: string,
    bucketKey: string,
    policyKey?: string,
    region?: string,
  ): Promise<any>;
  crearCarpeta(
    accessToken: string,
    projectId: string,
    folderData: any,
  ): Promise<any>;
  crearDescarga(
    accessToken: string,
    projectId: string,
    downloadData: any,
  ): Promise<any>;
  crearItem(
    accessToken: string,
    projectId: string,
    itemData: any,
  ): Promise<any>;
  crearReferenciaCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    refData: any,
  ): Promise<any>;
  crearReferenciaItem(
    accessToken: string,
    projectId: string,
    itemId: string,
    refData: any,
  ): Promise<any>;
  crearReferenciaVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
    refData: Record<string, any>,
  ): Promise<any>;
  crearStorage(
    accessToken: string,
    projectId: string,
    storageData: any,
  ): Promise<any>;
  crearStorageParaItem(
    accessToken: string,
    projectId: string,
    folderId: string,
    fileName: string,
  ): Promise<any>;
  crearSubcarpeta(
    accessToken: string,
    projectId: string,
    parentFolderId: string,
    folderName: string,
    folderType?: string,
  ): Promise<any>;
  crearVersion(
    accessToken: string,
    projectId: string,
    versionData: Record<string, any>,
    copyFrom?: string,
  ): Promise<any>;
  descargarItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any>;
  descargarItemPorVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any>;
  eliminarBucket(
    accessToken: string,
    bucketKey: string,
    region?: string,
  ): Promise<any>;
  eliminarCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any>;
  eliminarItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any>;
  esTokenExpirado(expiraEn: Date | string): boolean;
  moverItem(
    accessToken: string,
    projectId: string,
    itemId: string,
    targetFolderId: string,
  ): Promise<any>;
  obtenerBuckets(
    accessToken: string,
    region?: string,
    limit?: number,
    startAt?: string,
  ): Promise<any>;
  obtenerCarpetaPadre(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any>;
  obtenerCarpetaPorId(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any>;
  obtenerCarpetasPrincipales(
    accessToken: string,
    hubId: string,
    projectId: string,
  ): Promise<any>;
  obtenerContenidoCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerContenidoCarpetaTodasLasPaginas(
    accessToken: string,
    projectId: string,
    folderId: string,
    filters?: Record<string, any>,
  ): Promise<{ data: any[]; included: any[] }>;
  obtenerDescargas(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any>;
  obtenerDetallesBucket(
    accessToken: string,
    bucketKey: string,
    region?: string,
  ): Promise<any>;
  obtenerEstadoDescarga(
    accessToken: string,
    projectId: string,
    downloadId: string,
  ): Promise<any>;
  obtenerEstadoJob(
    accessToken: string,
    projectId: string,
    jobId: string,
  ): Promise<any>;
  obtenerFormatosDescarga(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any>;
  obtenerHubDeProyecto(
    accessToken: string,
    hubId: string,
    projectId: string,
  ): Promise<any>;
  obtenerHubs(accessToken: string, filters?: Record<string, any>): Promise<any>;
  obtenerItemPadre(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any>;
  obtenerItemPorId(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any>;
  obtenerItemVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any>;
  obtenerItems(
    accessToken: string,
    projectId: string,
    folderId?: string,
  ): Promise<any>;
  obtenerPerfilUsuario(accessToken: string, projectId: string): Promise<any>;
  obtenerProyectoPorId(
    accessToken: string,
    hubId: string,
    projectId: string,
  ): Promise<any>;
  obtenerProyectos(
    accessToken: string,
    hubId: string,
    filters?: Record<string, any>,
  ): Promise<any>;
  obtenerReferenciasCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any>;
  obtenerReferenciasItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any>;
  obtenerReferenciasVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any>;
  obtenerRelacionesLinksCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any>;
  obtenerRelacionesLinksItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any>;
  obtenerRelacionesLinksVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any>;
  obtenerRelacionesRefsCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any>;
  obtenerRelacionesRefsItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any>;
  obtenerRelacionesRefsVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any>;
  obtenerStorageUrl(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<{
    storageUrl: string;
    fileName: string;
    fileType: string;
    storageId: string;
  }>;
  obtenerTipVersion(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any>;
  obtenerUrlFirmadaS3(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
    parts?: number,
    options?: {
      firstPart?: number;
      uploadKey?: string;
      minutesExpiration?: number;
    },
  ): Promise<any>;
  obtenerVersionPorId(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any>;
  obtenerVersionesItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any>;
  restaurarCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any>;
  restaurarItem(
    accessToken: string,
    projectId: string,
    itemId: string,
    parentFolderId?: string,
  ): Promise<any>;
  subirArchivoAUrlFirmada(signedUrl: string, fileBuffer: Buffer): Promise<any>;
}
