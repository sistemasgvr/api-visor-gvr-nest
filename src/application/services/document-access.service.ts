import { ForbiddenError } from '../errors/application.error';
import type {
  DocumentAccessReader,
  DocumentCapability,
  DocumentHierarchy,
  DocumentLevel,
} from '../ports/document-access.port';
import type { AuthorizationService } from './authorization.service';

export const DOCUMENT_FULL_ACCESS = 'gestion_bim.documentos.acceso_total';
/** Nivel «Ver» en cualquier proyecto/carpeta sin asignación propia. */
export const DOCUMENT_VIEW_ALL = 'gestion_bim.documentos.ver_todos';
const VIEW_LEVEL = 1;
/** Permiso de rol para gestionar el proyecto (personas, niveles, flujos) sin nivel «Administrar». */
export const PROJECT_CONFIGURE = 'gestion_bim.proyectos.configurar';

/** Nivel mínimo (accpermissionlevels.level) para cada operación documental. */
export const DOCUMENT_CAPABILITY_LEVEL: Record<DocumentCapability, number> = {
  view: 1,
  download: 2,
  publish_markup: 3,
  upload: 4,
  create_folder: 4,
  edit: 5,
  delete: 5,
  delete_folder: 6,
  manage_permissions: 6,
};
const CAPABILITIES = Object.keys(
  DOCUMENT_CAPABILITY_LEVEL,
) as DocumentCapability[];
/** Carpetas sin registrar que se recorren hacia arriba antes de denegar. */
const MAX_UNREGISTERED_ANCESTORS = 12;

export interface DocumentAccess {
  fullAccess: boolean;
  level: number | null;
  code: string | null;
  capabilities: Record<DocumentCapability, boolean>;
}

export const normalizeAccProjectId = (projectId: string) =>
  projectId.startsWith('b.') ? projectId.slice(2) : projectId;

export type DocumentAnnotationKind = 'marca' | 'foto';

/**
 * Ítem (`urn:adsk.wipprod:dm.lineage:X`) de un documento expresado como URN del
 * visor en base64, URN de versión o el propio ítem. Null si no se reconoce.
 */
export function documentItemId(document: string | null | undefined) {
  let value = decodeURIComponent(String(document ?? '').trim());
  if (value.startsWith('urn:') && !value.startsWith('urn:adsk.')) {
    const encoded = value.slice(4).replace(/-/g, '+').replace(/_/g, '/');
    value = Buffer.from(encoded, 'base64').toString('utf8');
  }
  const match =
    /^urn:adsk\.(wipprod|wipemea|wipapac|wipstg):(?:fs\.file:vf|dm\.lineage)[.:]([A-Za-z0-9_-]+)(?:\?version=\d+)?$/.exec(
      value,
    );
  return match ? `urn:adsk.${match[1]}:dm.lineage:${match[2]}` : null;
}

/**
 * Los documentos de Gestión BIM se autorizan con el nivel asignado en el
 * proyecto/carpeta (useraccaccess). El rol sólo aporta el acceso total.
 * Sin asignación en la jerarquía, o ante cualquier error, se deniega.
 */
export class DocumentAccessService {
  constructor(
    private readonly reader: DocumentAccessReader,
    private readonly hierarchy: DocumentHierarchy,
    private readonly authorization: AuthorizationService,
  ) {}

  hasFullAccess(userId: number): Promise<boolean> {
    return this.authorization.can(userId, DOCUMENT_FULL_ACCESS);
  }

  hasViewAll(userId: number): Promise<boolean> {
    return this.authorization.can(userId, DOCUMENT_VIEW_ALL);
  }

  /** Nivel en una carpeta (o en el proyecto si no se indica carpeta). */
  async forFolder(
    userId: number,
    projectId: string,
    folderId?: string | null,
  ): Promise<DocumentAccess> {
    if (await this.hasFullAccess(userId)) return this.describe(true, null);
    const project = this.projectKey(projectId);
    const resolved = folderId
      ? await this.resolveFolder(userId, project, projectId, folderId)
      : await this.reader.level(userId, project);
    let level = this.belongsTo(resolved, project) ? resolved : null;
    // Sin nivel asignado, «ver todos» conserva la consulta que esos roles tenían.
    if ((level?.level ?? 0) < VIEW_LEVEL && (await this.hasViewAll(userId)))
      level = {
        found: true,
        project,
        level: VIEW_LEVEL,
        code: 'view',
        origin: null,
      };
    const access = this.describe(false, level);
    // «Configurar proyecto» (rol) permite gestionar permisos sin cambiar el nivel
    // sobre los documentos: no habilita editar, eliminar ni descargar.
    if (
      !access.capabilities.manage_permissions &&
      (await this.authorization.can(userId, PROJECT_CONFIGURE, {
        type: 'acc_project',
        id: project,
      }))
    )
      access.capabilities.manage_permissions = true;
    return access;
  }

  /** Nivel en la carpeta que contiene el archivo. */
  async forItem(
    userId: number,
    projectId: string,
    itemId: string,
  ): Promise<DocumentAccess> {
    if (await this.hasFullAccess(userId)) return this.describe(true, null);
    this.projectKey(projectId);
    // Si Autodesk no responde no se puede ubicar el archivo: se deniega.
    const folder = await this.hierarchy
      .parentOfItem(projectId, itemId)
      .catch(() => null);
    return folder
      ? this.forFolder(userId, projectId, folder)
      : this.describe(false, null);
  }

  async assertFolder(
    userId: number,
    projectId: string,
    folderId: string | null | undefined,
    capability: DocumentCapability,
  ): Promise<void> {
    this.require(await this.forFolder(userId, projectId, folderId), capability);
  }

  async assertItem(
    userId: number,
    projectId: string,
    itemId: string,
    capability: DocumentCapability,
  ): Promise<void> {
    this.require(await this.forItem(userId, projectId, itemId), capability);
  }

  /**
   * Recurso registrado (proyecto o carpeta) identificado por su ID interno o por
   * una asignación. Se usa para administrar quién accede y con qué nivel.
   */
  async assertResource(
    userId: number,
    target: { resourceId?: number | null; assignmentId?: number | null },
    capability: DocumentCapability,
  ): Promise<void> {
    if (await this.hasFullAccess(userId)) return;
    const resourceId = this.validId(target.resourceId);
    const assignmentId = this.validId(target.assignmentId);
    if (!resourceId && !assignmentId)
      throw new ForbiddenError('Recurso no válido');
    const resource = await this.reader.resource(resourceId, assignmentId);
    if (!resource.found || !resource.project || !resource.externalId)
      throw new ForbiddenError('Recurso no válido');
    await this.assertFolder(
      userId,
      resource.project,
      resource.type === 'project' ? null : resource.externalId,
      capability,
    );
  }

  /**
   * Registrar una carpeta en GVR fija de quién hereda permisos. Se exige que el
   * padre indicado sea su padre real en Autodesk y que el usuario pueda verlo.
   */
  async assertRegistration(
    userId: number,
    target: { externalId: string; type: string; parentId?: number | null },
  ): Promise<void> {
    if (await this.hasFullAccess(userId)) return;
    if (target.type === 'project') return;
    if (target.type !== 'folder') throw new ForbiddenError('Recurso no válido');
    const parentId = this.validId(target.parentId);
    // Re-registrar una carpeta con el mismo padre no cambia su herencia.
    const current = await this.reader.level(userId, target.externalId);
    if (current.found && parentId && current.parentId === parentId) return;
    const parent = parentId ? await this.reader.resource(parentId) : null;
    if (!parent?.found || !parent.project || !parent.externalId)
      throw new ForbiddenError('La carpeta padre no es válida');
    await this.assertFolder(
      userId,
      parent.project,
      parent.type === 'project' ? null : parent.externalId,
      'view',
    );
    const realParent = await this.hierarchy
      .parentOfFolder(parent.project, target.externalId)
      .catch(() => null);
    const matches =
      parent.type === 'project'
        ? !!realParent && !(await this.reader.level(userId, realParent)).found
        : realParent === parent.externalId;
    if (!matches)
      throw new ForbiddenError('La carpeta padre no coincide con Autodesk');
  }

  /**
   * Documento identificado como lo usa el visor o Data Management: URN del
   * visor (base64), URN de versión (`fs.file:vf.X?version=N`) o ítem (`dm.lineage:X`).
   */
  async assertDocument(
    userId: number,
    projectId: string,
    document: string | null | undefined,
    capability: DocumentCapability,
  ): Promise<void> {
    if (await this.hasFullAccess(userId)) return;
    const itemId = documentItemId(document);
    if (!itemId) throw new ForbiddenError('Documento no válido');
    await this.assertItem(userId, projectId, itemId, capability);
  }

  /** Marca o foto del visor: se autoriza sobre el archivo al que pertenece. */
  async assertAnnotation(
    userId: number,
    projectId: string,
    kind: DocumentAnnotationKind,
    id: number,
    capability: DocumentCapability,
  ): Promise<void> {
    if (await this.hasFullAccess(userId)) return;
    const annotationId = this.validId(id);
    const annotation = annotationId
      ? await this.reader.annotation(kind, annotationId)
      : null;
    if (
      !annotation?.found ||
      !annotation.itemId ||
      annotation.project !== this.projectKey(projectId)
    )
      throw new ForbiddenError('Anotación no válida');
    await this.assertItem(userId, projectId, annotation.itemId, capability);
  }

  /**
   * Participa en el proyecto: alguna asignación activa en el proyecto o en sus
   * carpetas (revisiones, flujos y listados del proyecto).
   */
  async assertProjectMember(userId: number, projectId: string): Promise<void> {
    if (await this.hasFullAccess(userId)) return;
    if (await this.hasViewAll(userId)) return;
    if (
      !(await this.reader.isProjectMember(userId, this.projectKey(projectId)))
    )
      throw new ForbiddenError({
        message: 'No participas en este proyecto',
        code: 'DOCUMENT_LEVEL_DENIED',
      });
  }

  /** La revisión indicada en la ruta debe ser del proyecto de la ruta. */
  async assertReviewInProject(
    projectId: string,
    reviewId: string | number,
    referenceId?: string | number | null,
  ): Promise<void> {
    const review = this.validId(Number(reviewId));
    const reference =
      referenceId == null ? null : this.validId(Number(referenceId));
    if (
      !review ||
      (referenceId != null && !reference) ||
      !(await this.reader.reviewInProject(
        review,
        this.projectKey(projectId),
        reference,
      ))
    )
      throw new ForbiddenError('La revisión no pertenece a este proyecto');
  }

  /** Administra el proyecto: nivel «Administrar» asignado en el propio proyecto. */
  async assertProjectAdmin(userId: number, projectId: string): Promise<void> {
    this.require(
      await this.forFolder(userId, projectId, null),
      'manage_permissions',
    );
  }

  /** Acciones reservadas al acceso total (p. ej. permisos por rol heredados de ACC). */
  async assertFullAccess(userId: number): Promise<void> {
    if (!(await this.hasFullAccess(userId)))
      throw new ForbiddenError({
        message: 'Se requiere acceso total a los documentos',
        code: 'DOCUMENT_FULL_ACCESS_REQUIRED',
      });
  }

  private validId(value: number | null | undefined) {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  }

  private async resolveFolder(
    userId: number,
    project: string,
    projectId: string,
    folderId: string,
  ): Promise<DocumentLevel | null> {
    let current: string | null = folderId;
    for (let step = 0; current && step <= MAX_UNREGISTERED_ANCESTORS; step++) {
      const level = await this.reader.level(userId, current);
      if (level.found) return level;
      // Carpeta aún no registrada en GVR: hereda de su carpeta padre en Autodesk.
      try {
        current = await this.hierarchy.parentOfFolder(projectId, current);
      } catch {
        return null;
      }
    }
    // Sin carpetas registradas en la cadena: rige la asignación del proyecto.
    return current ? null : this.reader.level(userId, project);
  }

  private belongsTo(level: DocumentLevel | null, project: string) {
    return !!level?.found && level.project === project;
  }

  private projectKey(projectId: string) {
    const key = normalizeAccProjectId(String(projectId ?? '').trim());
    if (!key) throw new ForbiddenError('Proyecto no válido');
    return key;
  }

  private describe(
    fullAccess: boolean,
    level: DocumentLevel | null,
  ): DocumentAccess {
    const value = fullAccess ? Number.POSITIVE_INFINITY : (level?.level ?? 0);
    const capabilities = Object.fromEntries(
      CAPABILITIES.map((capability) => [
        capability,
        value >= DOCUMENT_CAPABILITY_LEVEL[capability],
      ]),
    ) as Record<DocumentCapability, boolean>;
    return {
      fullAccess,
      level: fullAccess ? null : (level?.level ?? null),
      code: fullAccess ? 'admin' : (level?.code ?? null),
      capabilities,
    };
  }

  private require(access: DocumentAccess, capability: DocumentCapability) {
    if (!access.capabilities[capability])
      throw new ForbiddenError({
        message: 'Tu nivel en esta carpeta no permite realizar esta acción',
        code: 'DOCUMENT_LEVEL_DENIED',
      });
  }
}
