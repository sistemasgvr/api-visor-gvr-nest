import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpClientService } from '../http/http-client.service';
import type { AutodeskApiPort } from '../../application/ports/autodesk-api.port';
import type { AutodeskClientContext } from '../autodesk/autodesk-client.base';
import { AutodeskAuthClient } from '../autodesk/auth.client';
import { AutodeskDataManagementClient } from '../autodesk/data-management.client';
import { AutodeskAdminClient } from '../autodesk/admin.client';
import { AutodeskIssuesClient } from '../autodesk/issues.client';
import { AutodeskBim360Client } from '../autodesk/bim360.client';
import { AutodeskReviewsClient } from '../autodesk/reviews.client';
export interface Token2LeggedResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: Date;
}
export interface Token3LeggedResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  expires_at: Date;
}

/** Fachada compatible: delega en clientes HTTP por capacidad sin cambiar contratos ni llamadas. */
@Injectable()
export class AutodeskApiService implements AutodeskApiPort {
  private readonly logger = new Logger(AutodeskApiService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly callbackUrl: string;
  private readonly auth: AutodeskAuthClient;
  private readonly data_management: AutodeskDataManagementClient;
  private readonly admin: AutodeskAdminClient;
  private readonly issues: AutodeskIssuesClient;
  private readonly bim360: AutodeskBim360Client;
  private readonly reviews: AutodeskReviewsClient;
  constructor(
    httpClient: HttpClientService,
    private readonly configService: ConfigService,
  ) {
    this.clientId = this.configService.get<string>('AUTODESK_CLIENT_ID') || '';
    this.clientSecret =
      this.configService.get<string>('AUTODESK_CLIENT_SECRET') || '';
    this.callbackUrl =
      this.configService.get<string>('AUTODESK_CALLBACK_URL') || '';

    const context: AutodeskClientContext = {
      api: this,
      httpClient,
      configService,
      logger: this.logger,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      callbackUrl: this.callbackUrl,
    };
    this.auth = new AutodeskAuthClient(context);
    this.data_management = new AutodeskDataManagementClient(context);
    this.admin = new AutodeskAdminClient(context);
    this.issues = new AutodeskIssuesClient(context);
    this.bim360 = new AutodeskBim360Client(context);
    this.reviews = new AutodeskReviewsClient(context);
  }
  obtenerToken2Legged(scopes: string[]): Promise<Token2LeggedResponse> {
    return this.auth.obtenerToken2Legged(scopes);
  }
  generarUrlAutorizacion(scopes: string[], state: string): string {
    return this.auth.generarUrlAutorizacion(scopes, state);
  }
  intercambiarCodigoPorToken(code: string): Promise<Token3LeggedResponse> {
    return this.auth.intercambiarCodigoPorToken(code);
  }
  esTokenExpirado(expiraEn: Date | string): boolean {
    return this.auth.esTokenExpirado(expiraEn);
  }
  obtenerPerfilUsuarioAcc(accessToken: string): Promise<{
    userId: string;
    userName: string;
    emailId: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    profileImages?: any;
  }> {
    return this.auth.obtenerPerfilUsuarioAcc(accessToken);
  }
  refrescarToken(refreshToken: string): Promise<Token3LeggedResponse> {
    return this.auth.refrescarToken(refreshToken);
  }
  obtenerHubs(
    accessToken: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.data_management.obtenerHubs(accessToken, filters);
  }
  obtenerProyectos(
    accessToken: string,
    hubId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.data_management.obtenerProyectos(accessToken, hubId, filters);
  }
  obtenerProyectoPorId(
    accessToken: string,
    hubId: string,
    projectId: string,
  ): Promise<any> {
    return this.data_management.obtenerProyectoPorId(
      accessToken,
      hubId,
      projectId,
    );
  }
  obtenerItems(
    accessToken: string,
    projectId: string,
    folderId?: string,
  ): Promise<any> {
    return this.data_management.obtenerItems(accessToken, projectId, folderId);
  }
  obtenerItemPorId(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    return this.data_management.obtenerItemPorId(
      accessToken,
      projectId,
      itemId,
    );
  }
  obtenerVersionesItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    return this.data_management.obtenerVersionesItem(
      accessToken,
      projectId,
      itemId,
    );
  }
  obtenerCarpetaPorId(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    return this.data_management.obtenerCarpetaPorId(
      accessToken,
      projectId,
      folderId,
    );
  }
  obtenerContenidoCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.data_management.obtenerContenidoCarpeta(
      accessToken,
      projectId,
      folderId,
      filters,
    );
  }
  obtenerContenidoCarpetaTodasLasPaginas(
    accessToken: string,
    projectId: string,
    folderId: string,
    filters: Record<string, any> = {},
  ): Promise<{ data: any[]; included: any[] }> {
    return this.data_management.obtenerContenidoCarpetaTodasLasPaginas(
      accessToken,
      projectId,
      folderId,
      filters,
    );
  }
  buscarEnContenidoCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    searchName?: string,
    filterType?: string,
    extensionType?: string,
    additionalFilters: Record<string, any> = {},
  ): Promise<any> {
    return this.data_management.buscarEnContenidoCarpeta(
      accessToken,
      projectId,
      folderId,
      searchName,
      filterType,
      extensionType,
      additionalFilters,
    );
  }
  obtenerCarpetaPadre(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    return this.data_management.obtenerCarpetaPadre(
      accessToken,
      projectId,
      folderId,
    );
  }
  obtenerReferenciasCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    return this.data_management.obtenerReferenciasCarpeta(
      accessToken,
      projectId,
      folderId,
    );
  }
  obtenerRelacionesLinksCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    return this.data_management.obtenerRelacionesLinksCarpeta(
      accessToken,
      projectId,
      folderId,
    );
  }
  obtenerRelacionesRefsCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    return this.data_management.obtenerRelacionesRefsCarpeta(
      accessToken,
      projectId,
      folderId,
    );
  }
  buscarEnCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.data_management.buscarEnCarpeta(
      accessToken,
      projectId,
      folderId,
      filters,
    );
  }
  crearCarpeta(
    accessToken: string,
    projectId: string,
    folderData: any,
  ): Promise<any> {
    return this.data_management.crearCarpeta(
      accessToken,
      projectId,
      folderData,
    );
  }
  crearSubcarpeta(
    accessToken: string,
    projectId: string,
    parentFolderId: string,
    folderName: string,
    folderType?: string,
  ): Promise<any> {
    return this.data_management.crearSubcarpeta(
      accessToken,
      projectId,
      parentFolderId,
      folderName,
      folderType,
    );
  }
  crearReferenciaCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    refData: any,
  ): Promise<any> {
    return this.data_management.crearReferenciaCarpeta(
      accessToken,
      projectId,
      folderId,
      refData,
    );
  }
  actualizarCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
    updateData: any,
  ): Promise<any> {
    return this.data_management.actualizarCarpeta(
      accessToken,
      projectId,
      folderId,
      updateData,
    );
  }
  eliminarCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    return this.data_management.eliminarCarpeta(
      accessToken,
      projectId,
      folderId,
    );
  }
  restaurarCarpeta(
    accessToken: string,
    projectId: string,
    folderId: string,
  ): Promise<any> {
    return this.data_management.restaurarCarpeta(
      accessToken,
      projectId,
      folderId,
    );
  }
  obtenerHubDeProyecto(
    accessToken: string,
    hubId: string,
    projectId: string,
  ): Promise<any> {
    return this.data_management.obtenerHubDeProyecto(
      accessToken,
      hubId,
      projectId,
    );
  }
  obtenerCarpetasPrincipales(
    accessToken: string,
    hubId: string,
    projectId: string,
  ): Promise<any> {
    return this.data_management.obtenerCarpetasPrincipales(
      accessToken,
      hubId,
      projectId,
    );
  }
  crearStorage(
    accessToken: string,
    projectId: string,
    storageData: any,
  ): Promise<any> {
    return this.data_management.crearStorage(
      accessToken,
      projectId,
      storageData,
    );
  }
  crearDescarga(
    accessToken: string,
    projectId: string,
    downloadData: any,
  ): Promise<any> {
    return this.data_management.crearDescarga(
      accessToken,
      projectId,
      downloadData,
    );
  }
  obtenerEstadoDescarga(
    accessToken: string,
    projectId: string,
    downloadId: string,
  ): Promise<any> {
    return this.data_management.obtenerEstadoDescarga(
      accessToken,
      projectId,
      downloadId,
    );
  }
  obtenerEstadoJob(
    accessToken: string,
    projectId: string,
    jobId: string,
  ): Promise<any> {
    return this.data_management.obtenerEstadoJob(accessToken, projectId, jobId);
  }
  descargarItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    return this.data_management.descargarItem(accessToken, projectId, itemId);
  }
  descargarItemPorVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    return this.data_management.descargarItemPorVersion(
      accessToken,
      projectId,
      versionId,
    );
  }
  obtenerStorageUrl(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<{
    storageUrl: string;
    fileName: string;
    fileType: string;
    storageId: string;
  }> {
    return this.data_management.obtenerStorageUrl(
      accessToken,
      projectId,
      itemId,
    );
  }
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
  }> {
    return this.data_management.obtenerStorageUrlPorVersion(
      accessToken,
      projectId,
      versionId,
    );
  }
  obtenerItemPadre(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    return this.data_management.obtenerItemPadre(
      accessToken,
      projectId,
      itemId,
    );
  }
  obtenerReferenciasItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    return this.data_management.obtenerReferenciasItem(
      accessToken,
      projectId,
      itemId,
    );
  }
  obtenerRelacionesLinksItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    return this.data_management.obtenerRelacionesLinksItem(
      accessToken,
      projectId,
      itemId,
    );
  }
  obtenerRelacionesRefsItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    return this.data_management.obtenerRelacionesRefsItem(
      accessToken,
      projectId,
      itemId,
    );
  }
  obtenerTipVersion(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    return this.data_management.obtenerTipVersion(
      accessToken,
      projectId,
      itemId,
    );
  }
  obtenerManifiesto(urn: string): Promise<any> {
    return this.data_management.obtenerManifiesto(urn);
  }
  obtenerMetadatos(urn: string): Promise<any> {
    return this.data_management.obtenerMetadatos(urn);
  }
  obtenerUrlMiniatura(accessToken: string, snapshotUrn: string): Promise<any> {
    return this.data_management.obtenerUrlMiniatura(accessToken, snapshotUrn);
  }
  obtenerVersionPorId(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    return this.data_management.obtenerVersionPorId(
      accessToken,
      projectId,
      versionId,
    );
  }
  obtenerFormatosDescarga(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    return this.data_management.obtenerFormatosDescarga(
      accessToken,
      projectId,
      versionId,
    );
  }
  obtenerDescargas(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    return this.data_management.obtenerDescargas(
      accessToken,
      projectId,
      versionId,
    );
  }
  obtenerItemVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    return this.data_management.obtenerItemVersion(
      accessToken,
      projectId,
      versionId,
    );
  }
  obtenerReferenciasVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    return this.data_management.obtenerReferenciasVersion(
      accessToken,
      projectId,
      versionId,
    );
  }
  obtenerRelacionesLinksVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    return this.data_management.obtenerRelacionesLinksVersion(
      accessToken,
      projectId,
      versionId,
    );
  }
  obtenerRelacionesRefsVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
  ): Promise<any> {
    return this.data_management.obtenerRelacionesRefsVersion(
      accessToken,
      projectId,
      versionId,
    );
  }
  crearVersion(
    accessToken: string,
    projectId: string,
    versionData: Record<string, any>,
    copyFrom?: string,
  ): Promise<any> {
    return this.data_management.crearVersion(
      accessToken,
      projectId,
      versionData,
      copyFrom,
    );
  }
  crearReferenciaVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
    refData: Record<string, any>,
  ): Promise<any> {
    return this.data_management.crearReferenciaVersion(
      accessToken,
      projectId,
      versionId,
      refData,
    );
  }
  actualizarVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
    updateData: Record<string, any>,
  ): Promise<any> {
    return this.data_management.actualizarVersion(
      accessToken,
      projectId,
      versionId,
      updateData,
    );
  }
  crearUsuario(
    accessToken: string,
    accountId: string,
    userData: Record<string, any>,
    region?: string,
  ): Promise<any> {
    return this.data_management.crearUsuario(
      accessToken,
      accountId,
      userData,
      region,
    );
  }
  importarUsuarios(
    accessToken: string,
    accountId: string,
    users: any[],
    region?: string,
  ): Promise<any> {
    return this.data_management.importarUsuarios(
      accessToken,
      accountId,
      users,
      region,
    );
  }
  obtenerUsuarios(
    accessToken: string,
    accountId: string,
    filters: Record<string, any> = {},
    region?: string,
  ): Promise<any> {
    return this.data_management.obtenerUsuarios(
      accessToken,
      accountId,
      filters,
      region,
    );
  }
  obtenerUsuarioPorId(
    accessToken: string,
    accountId: string,
    userId: string,
    region?: string,
  ): Promise<any> {
    return this.data_management.obtenerUsuarioPorId(
      accessToken,
      accountId,
      userId,
      region,
    );
  }
  obtenerProyectosUsuario(
    accessToken: string,
    accountId: string,
    userId: string,
    filters: Record<string, any> = {},
    region?: string,
  ): Promise<any> {
    return this.data_management.obtenerProyectosUsuario(
      accessToken,
      accountId,
      userId,
      filters,
      region,
    );
  }
  buscarUsuarios(
    accessToken: string,
    accountId: string,
    searchTerm: string,
    filters: Record<string, any> = {},
    region?: string,
  ): Promise<any> {
    return this.data_management.buscarUsuarios(
      accessToken,
      accountId,
      searchTerm,
      filters,
      region,
    );
  }
  actualizarUsuario(
    accessToken: string,
    accountId: string,
    userId: string,
    userData: Record<string, any>,
    region?: string,
  ): Promise<any> {
    return this.data_management.actualizarUsuario(
      accessToken,
      accountId,
      userId,
      userData,
      region,
    );
  }
  obtenerUsuarioProyectoPorId(
    accessToken: string,
    projectId: string,
    projectUserId: string,
    region?: string,
    userId?: string,
  ): Promise<any> {
    return this.data_management.obtenerUsuarioProyectoPorId(
      accessToken,
      projectId,
      projectUserId,
      region,
      userId,
    );
  }
  agregarUsuarioProyecto(
    accessToken: string,
    projectId: string,
    userData: Record<string, any>,
    region?: string,
    userId?: string,
  ): Promise<any> {
    return this.data_management.agregarUsuarioProyecto(
      accessToken,
      projectId,
      userData,
      region,
      userId,
    );
  }
  actualizarUsuarioProyecto(
    accessToken: string,
    projectId: string,
    projectUserId: string,
    userData: Record<string, any>,
    region?: string,
    userId?: string,
  ): Promise<any> {
    return this.data_management.actualizarUsuarioProyecto(
      accessToken,
      projectId,
      projectUserId,
      userData,
      region,
      userId,
    );
  }
  eliminarUsuarioProyecto(
    accessToken: string,
    projectId: string,
    projectUserId: string,
    region?: string,
    userId?: string,
  ): Promise<any> {
    return this.data_management.eliminarUsuarioProyecto(
      accessToken,
      projectId,
      projectUserId,
      region,
      userId,
    );
  }
  obtenerProyectosNew(
    accessToken: string,
    accountId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.data_management.obtenerProyectosNew(
      accessToken,
      accountId,
      filters,
    );
  }
  obtenerProyectoPorIdNew(
    accessToken: string,
    accountId: string,
    projectId: string,
  ): Promise<any> {
    return this.data_management.obtenerProyectoPorIdNew(
      accessToken,
      accountId,
      projectId,
    );
  }
  obtenerIssueContainerId(
    accessToken: string,
    accountId: string,
    projectId: string,
  ): Promise<any> {
    return this.data_management.obtenerIssueContainerId(
      accessToken,
      accountId,
      projectId,
    );
  }
  obtenerBuckets(
    accessToken: string,
    region?: string,
    limit?: number,
    startAt?: string,
  ): Promise<any> {
    return this.data_management.obtenerBuckets(
      accessToken,
      region,
      limit,
      startAt,
    );
  }
  obtenerDetallesBucket(
    accessToken: string,
    bucketKey: string,
    region?: string,
  ): Promise<any> {
    return this.data_management.obtenerDetallesBucket(
      accessToken,
      bucketKey,
      region,
    );
  }
  crearBucket(
    accessToken: string,
    bucketKey: string,
    policyKey: string = 'transient',
    region?: string,
  ): Promise<any> {
    return this.data_management.crearBucket(
      accessToken,
      bucketKey,
      policyKey,
      region,
    );
  }
  eliminarBucket(
    accessToken: string,
    bucketKey: string,
    region?: string,
  ): Promise<any> {
    return this.data_management.eliminarBucket(accessToken, bucketKey, region);
  }
  crearStorageParaItem(
    accessToken: string,
    projectId: string,
    folderId: string,
    fileName: string,
  ): Promise<any> {
    return this.data_management.crearStorageParaItem(
      accessToken,
      projectId,
      folderId,
      fileName,
    );
  }
  obtenerUrlFirmadaS3(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
    parts: number = 1,
    options?: {
      firstPart?: number;
      uploadKey?: string;
      minutesExpiration?: number;
    },
  ): Promise<any> {
    return this.data_management.obtenerUrlFirmadaS3(
      accessToken,
      bucketKey,
      objectKey,
      parts,
      options,
    );
  }
  subirArchivoAUrlFirmada(signedUrl: string, fileBuffer: Buffer): Promise<any> {
    return this.data_management.subirArchivoAUrlFirmada(signedUrl, fileBuffer);
  }
  completarSubida(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
    uploadKey: string,
    options?: { eTags?: string[]; size?: number },
  ): Promise<any> {
    return this.data_management.completarSubida(
      accessToken,
      bucketKey,
      objectKey,
      uploadKey,
      options,
    );
  }
  crearItem(
    accessToken: string,
    projectId: string,
    itemData: any,
  ): Promise<any> {
    return this.data_management.crearItem(accessToken, projectId, itemData);
  }
  copiarItem(
    accessToken: string,
    projectId: string,
    sourceVersionUrn: string,
    targetFolderId: string,
    fileName: string,
  ): Promise<any> {
    return this.data_management.copiarItem(
      accessToken,
      projectId,
      sourceVersionUrn,
      targetFolderId,
      fileName,
    );
  }
  crearReferenciaItem(
    accessToken: string,
    projectId: string,
    itemId: string,
    refData: any,
  ): Promise<any> {
    return this.data_management.crearReferenciaItem(
      accessToken,
      projectId,
      itemId,
      refData,
    );
  }
  actualizarItem(
    accessToken: string,
    projectId: string,
    itemId: string,
    itemData: any,
  ): Promise<any> {
    return this.data_management.actualizarItem(
      accessToken,
      projectId,
      itemId,
      itemData,
    );
  }
  moverItem(
    accessToken: string,
    projectId: string,
    itemId: string,
    targetFolderId: string,
  ): Promise<any> {
    return this.data_management.moverItem(
      accessToken,
      projectId,
      itemId,
      targetFolderId,
    );
  }
  eliminarItem(
    accessToken: string,
    projectId: string,
    itemId: string,
  ): Promise<any> {
    return this.data_management.eliminarItem(accessToken, projectId, itemId);
  }
  restaurarItem(
    accessToken: string,
    projectId: string,
    itemId: string,
    parentFolderId?: string,
  ): Promise<any> {
    return this.data_management.restaurarItem(
      accessToken,
      projectId,
      itemId,
      parentFolderId,
    );
  }
  obtenerUrlFirmadaS3Upload(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
  ): Promise<any> {
    return this.data_management.obtenerUrlFirmadaS3Upload(
      accessToken,
      bucketKey,
      objectKey,
    );
  }
  subirArchivoS3(
    uploadUrl: string,
    content: Buffer | string,
    contentType: string,
  ): Promise<any> {
    return this.data_management.subirArchivoS3(uploadUrl, content, contentType);
  }
  finalizarUploadS3(
    accessToken: string,
    bucketKey: string,
    objectKey: string,
    uploadKey: string,
  ): Promise<any> {
    return this.data_management.finalizarUploadS3(
      accessToken,
      bucketKey,
      objectKey,
      uploadKey,
    );
  }
  getAccProjects(
    accountId: string,
    options: Record<string, any> = {},
    token?: string,
  ): Promise<any> {
    return this.admin.getAccProjects(accountId, options, token);
  }
  getAccProjectById(
    projectId: string,
    fields: string[] = [],
    token?: string,
  ): Promise<any> {
    return this.admin.getAccProjectById(projectId, fields, token);
  }
  createAccProject(
    accountId: string,
    projectData: Record<string, any>,
    token?: string,
    userId?: string,
  ): Promise<any> {
    return this.admin.createAccProject(accountId, projectData, token, userId);
  }
  updateAccProject(
    accountId: string,
    projectId: string,
    projectData: Record<string, any>,
    token?: string,
    userId?: string,
  ): Promise<any> {
    return this.admin.updateAccProject(
      accountId,
      projectId,
      projectData,
      token,
      userId,
    );
  }
  uploadAccProjectImage(
    accountId: string,
    projectId: string,
    file: Express.Multer.File,
    token?: string,
  ): Promise<any> {
    return this.admin.uploadAccProjectImage(accountId, projectId, file, token);
  }
  crearCompany(
    accessToken: string,
    accountId: string,
    companyData: Record<string, any>,
    region?: string,
  ): Promise<any> {
    return this.admin.crearCompany(accessToken, accountId, companyData, region);
  }
  importarCompanies(
    accessToken: string,
    accountId: string,
    companies: any[],
    region?: string,
  ): Promise<any> {
    return this.admin.importarCompanies(
      accessToken,
      accountId,
      companies,
      region,
    );
  }
  obtenerCompanies(
    accessToken: string,
    accountId: string,
    params: Record<string, any> = {},
    region?: string,
  ): Promise<any> {
    return this.admin.obtenerCompanies(accessToken, accountId, params, region);
  }
  obtenerCompanyPorId(
    accessToken: string,
    accountId: string,
    companyId: string,
    region?: string,
  ): Promise<any> {
    return this.admin.obtenerCompanyPorId(
      accessToken,
      accountId,
      companyId,
      region,
    );
  }
  buscarCompanies(
    accessToken: string,
    accountId: string,
    searchTerm: string,
    params: Record<string, any> = {},
    region?: string,
  ): Promise<any> {
    return this.admin.buscarCompanies(
      accessToken,
      accountId,
      searchTerm,
      params,
      region,
    );
  }
  obtenerCompaniesPorProyecto(
    accessToken: string,
    accountId: string,
    projectId: string,
    params: Record<string, any> = {},
    region?: string,
  ): Promise<any> {
    return this.admin.obtenerCompaniesPorProyecto(
      accessToken,
      accountId,
      projectId,
      params,
      region,
    );
  }
  actualizarCompany(
    accessToken: string,
    accountId: string,
    companyId: string,
    updateData: Record<string, any>,
    region?: string,
  ): Promise<any> {
    return this.admin.actualizarCompany(
      accessToken,
      accountId,
      companyId,
      updateData,
      region,
    );
  }
  subirImagenCompany(
    accessToken: string,
    accountId: string,
    companyId: string,
    file: Express.Multer.File,
    region?: string,
  ): Promise<any> {
    return this.admin.subirImagenCompany(
      accessToken,
      accountId,
      companyId,
      file,
      region,
    );
  }
  obtenerProductosUsuario(
    accessToken: string,
    accountId: string,
    userId: string,
    region?: string,
  ): Promise<any> {
    return this.admin.obtenerProductosUsuario(
      accessToken,
      accountId,
      userId,
      region,
    );
  }
  obtenerRolesUsuario(
    accessToken: string,
    accountId: string,
    userId: string,
    region?: string,
  ): Promise<any> {
    return this.admin.obtenerRolesUsuario(
      accessToken,
      accountId,
      userId,
      region,
    );
  }
  obtenerUsuariosProyecto(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
    region?: string,
    userId?: string,
  ): Promise<any> {
    return this.admin.obtenerUsuariosProyecto(
      accessToken,
      projectId,
      filters,
      region,
      userId,
    );
  }
  buscarUsuariosProyecto(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
    region?: string,
    userId?: string,
  ): Promise<any> {
    return this.admin.buscarUsuariosProyecto(
      accessToken,
      projectId,
      filters,
      region,
      userId,
    );
  }
  importarUsuariosProyecto(
    accessToken: string,
    projectId: string,
    users: any[],
    region?: string,
    userId?: string,
  ): Promise<any> {
    return this.admin.importarUsuariosProyecto(
      accessToken,
      projectId,
      users,
      region,
      userId,
    );
  }
  obtenerBusinessUnits(
    accessToken: string,
    accountId: string,
    region?: string,
  ): Promise<any> {
    return this.admin.obtenerBusinessUnits(accessToken, accountId, region);
  }
  obtenerBusinessUnitPorId(
    accessToken: string,
    accountId: string,
    businessUnitId: string,
    region?: string,
  ): Promise<any> {
    return this.admin.obtenerBusinessUnitPorId(
      accessToken,
      accountId,
      businessUnitId,
      region,
    );
  }
  obtenerBusinessUnitsHijas(
    accessToken: string,
    accountId: string,
    parentId?: string,
    region?: string,
  ): Promise<any> {
    return this.admin.obtenerBusinessUnitsHijas(
      accessToken,
      accountId,
      parentId,
      region,
    );
  }
  obtenerArbolBusinessUnits(
    accessToken: string,
    accountId: string,
    region?: string,
  ): Promise<any> {
    return this.admin.obtenerArbolBusinessUnits(accessToken, accountId, region);
  }
  buscarBusinessUnits(
    accessToken: string,
    accountId: string,
    searchTerm: string,
    region?: string,
  ): Promise<any> {
    return this.admin.buscarBusinessUnits(
      accessToken,
      accountId,
      searchTerm,
      region,
    );
  }
  crearOActualizarBusinessUnits(
    accessToken: string,
    accountId: string,
    businessUnits: any[],
    region?: string,
  ): Promise<any> {
    return this.admin.crearOActualizarBusinessUnits(
      accessToken,
      accountId,
      businessUnits,
      region,
    );
  }
  obtenerPerfilUsuario(accessToken: string, projectId: string): Promise<any> {
    return this.issues.obtenerPerfilUsuario(accessToken, projectId);
  }
  obtenerTiposIncidencias(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.issues.obtenerTiposIncidencias(accessToken, projectId, filters);
  }
  obtenerDefinicionesAtributos(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.issues.obtenerDefinicionesAtributos(
      accessToken,
      projectId,
      filters,
    );
  }
  obtenerMapeosAtributos(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.issues.obtenerMapeosAtributos(accessToken, projectId, filters);
  }
  obtenerCategoriasRaiz(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.issues.obtenerCategoriasRaiz(accessToken, projectId, filters);
  }
  obtenerIncidencias(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.issues.obtenerIncidencias(accessToken, projectId, filters);
  }
  crearIncidencia(
    accessToken: string,
    projectId: string,
    data: Record<string, any>,
  ): Promise<any> {
    return this.issues.crearIncidencia(accessToken, projectId, data);
  }
  obtenerIncidenciaPorId(
    accessToken: string,
    projectId: string,
    issueId: string,
  ): Promise<any> {
    return this.issues.obtenerIncidenciaPorId(accessToken, projectId, issueId);
  }
  actualizarIncidencia(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any> {
    return this.issues.actualizarIncidencia(
      accessToken,
      projectId,
      issueId,
      data,
    );
  }
  obtenerComentarios(
    accessToken: string,
    projectId: string,
    issueId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.issues.obtenerComentarios(
      accessToken,
      projectId,
      issueId,
      filters,
    );
  }
  crearComentario(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any> {
    return this.issues.crearComentario(accessToken, projectId, issueId, data);
  }
  crearAdjunto(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any> {
    return this.issues.crearAdjunto(accessToken, projectId, issueId, data);
  }
  obtenerAdjuntos(
    accessToken: string,
    projectId: string,
    issueId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.issues.obtenerAdjuntos(
      accessToken,
      projectId,
      issueId,
      filters,
    );
  }
  eliminarAdjunto(
    accessToken: string,
    projectId: string,
    issueId: string,
    attachmentId: string,
  ): Promise<any> {
    return this.issues.eliminarAdjunto(
      accessToken,
      projectId,
      issueId,
      attachmentId,
    );
  }
  exportarIncidencias(
    accessToken: string,
    projectId: string,
    dto: any,
  ): Promise<any> {
    return this.issues.exportarIncidencias(accessToken, projectId, dto);
  }
  subirMiniaturaIssue(
    accessToken: string,
    projectId: string,
    content: Buffer | string,
    filename: string,
    contentType: string,
  ): Promise<{ success: boolean; urn?: string; error?: string }> {
    return this.issues.subirMiniaturaIssue(
      accessToken,
      projectId,
      content,
      filename,
      contentType,
    );
  }
  obtenerPerfilUsuarioBim360(
    accessToken: string,
    projectId: string,
  ): Promise<any> {
    return this.bim360.obtenerPerfilUsuarioBim360(accessToken, projectId);
  }
  obtenerTiposIncidenciasBim360(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.bim360.obtenerTiposIncidenciasBim360(
      accessToken,
      projectId,
      filters,
    );
  }
  obtenerDefinicionesAtributosBim360(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.bim360.obtenerDefinicionesAtributosBim360(
      accessToken,
      projectId,
      filters,
    );
  }
  obtenerMapeosAtributosBim360(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.bim360.obtenerMapeosAtributosBim360(
      accessToken,
      projectId,
      filters,
    );
  }
  obtenerCategoriasRaizBim360(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.bim360.obtenerCategoriasRaizBim360(
      accessToken,
      projectId,
      filters,
    );
  }
  obtenerIncidenciasBim360(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.bim360.obtenerIncidenciasBim360(
      accessToken,
      projectId,
      filters,
    );
  }
  crearIncidenciaBim360(
    accessToken: string,
    projectId: string,
    data: Record<string, any>,
  ): Promise<any> {
    return this.bim360.crearIncidenciaBim360(accessToken, projectId, data);
  }
  obtenerIncidenciaPorIdBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
  ): Promise<any> {
    return this.bim360.obtenerIncidenciaPorIdBim360(
      accessToken,
      projectId,
      issueId,
    );
  }
  actualizarIncidenciaBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any> {
    return this.bim360.actualizarIncidenciaBim360(
      accessToken,
      projectId,
      issueId,
      data,
    );
  }
  obtenerComentariosBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.bim360.obtenerComentariosBim360(
      accessToken,
      projectId,
      issueId,
      filters,
    );
  }
  crearComentarioBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any> {
    return this.bim360.crearComentarioBim360(
      accessToken,
      projectId,
      issueId,
      data,
    );
  }
  obtenerAdjuntosBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.bim360.obtenerAdjuntosBim360(
      accessToken,
      projectId,
      issueId,
      filters,
    );
  }
  crearAdjuntoBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    data: Record<string, any>,
  ): Promise<any> {
    return this.bim360.crearAdjuntoBim360(
      accessToken,
      projectId,
      issueId,
      data,
    );
  }
  actualizarAdjuntoBim360(
    accessToken: string,
    projectId: string,
    issueId: string,
    attachmentId: string,
    data: Record<string, any>,
  ): Promise<any> {
    return this.bim360.actualizarAdjuntoBim360(
      accessToken,
      projectId,
      issueId,
      attachmentId,
      data,
    );
  }
  crearProyectoBim360(
    accessToken: string,
    accountId: string,
    projectData: Record<string, any>,
    region?: string,
  ): Promise<any> {
    return this.bim360.crearProyectoBim360(
      accessToken,
      accountId,
      projectData,
      region,
    );
  }
  obtenerProyectosLegacy(
    accessToken: string,
    accountId: string,
    filters: Record<string, any> = {},
    region?: string,
  ): Promise<any> {
    return this.bim360.obtenerProyectosLegacy(
      accessToken,
      accountId,
      filters,
      region,
    );
  }
  obtenerProyectoPorIdLegacy(
    accessToken: string,
    accountId: string,
    projectId: string,
    region?: string,
  ): Promise<any> {
    return this.bim360.obtenerProyectoPorIdLegacy(
      accessToken,
      accountId,
      projectId,
      region,
    );
  }
  actualizarProyectoBim360(
    accessToken: string,
    accountId: string,
    projectId: string,
    updateData: Record<string, any>,
    region?: string,
  ): Promise<any> {
    return this.bim360.actualizarProyectoBim360(
      accessToken,
      accountId,
      projectId,
      updateData,
      region,
    );
  }
  actualizarImagenProyectoBim360(
    accessToken: string,
    accountId: string,
    projectId: string,
    imageData: string,
    region?: string,
  ): Promise<any> {
    return this.bim360.actualizarImagenProyectoBim360(
      accessToken,
      accountId,
      projectId,
      imageData,
      region,
    );
  }
  obtenerRevisiones(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.reviews.obtenerRevisiones(accessToken, projectId, filters);
  }
  crearRevision(
    accessToken: string,
    projectId: string,
    data: Record<string, any>,
  ): Promise<any> {
    return this.reviews.crearRevision(accessToken, projectId, data);
  }
  obtenerRevisionPorId(
    accessToken: string,
    projectId: string,
    reviewId: string,
  ): Promise<any> {
    return this.reviews.obtenerRevisionPorId(accessToken, projectId, reviewId);
  }
  obtenerWorkflowRevision(
    accessToken: string,
    projectId: string,
    reviewId: string,
  ): Promise<any> {
    return this.reviews.obtenerWorkflowRevision(
      accessToken,
      projectId,
      reviewId,
    );
  }
  obtenerProgresoRevision(
    accessToken: string,
    projectId: string,
    reviewId: string,
  ): Promise<any> {
    return this.reviews.obtenerProgresoRevision(
      accessToken,
      projectId,
      reviewId,
    );
  }
  obtenerVersionesRevision(
    accessToken: string,
    projectId: string,
    reviewId: string,
  ): Promise<any> {
    return this.reviews.obtenerVersionesRevision(
      accessToken,
      projectId,
      reviewId,
    );
  }
  obtenerWorkflows(
    accessToken: string,
    projectId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.reviews.obtenerWorkflows(accessToken, projectId, filters);
  }
  obtenerWorkflowPorId(
    accessToken: string,
    projectId: string,
    workflowId: string,
  ): Promise<any> {
    return this.reviews.obtenerWorkflowPorId(
      accessToken,
      projectId,
      workflowId,
    );
  }
  crearWorkflow(
    accessToken: string,
    projectId: string,
    data: Record<string, any>,
  ): Promise<any> {
    return this.reviews.crearWorkflow(accessToken, projectId, data);
  }
  obtenerApprovalStatusesVersion(
    accessToken: string,
    projectId: string,
    versionId: string,
    filters: Record<string, any> = {},
  ): Promise<any> {
    return this.reviews.obtenerApprovalStatusesVersion(
      accessToken,
      projectId,
      versionId,
      filters,
    );
  }
}
