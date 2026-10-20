export const DOCUMENT_ACCESS_READER = Symbol('DOCUMENT_ACCESS_READER');
export const DOCUMENT_HIERARCHY = Symbol('DOCUMENT_HIERARCHY');

/** Operaciones sobre documentos de un proyecto BIM, controladas por el nivel del proyecto/carpeta. */
export type DocumentCapability =
  | 'view'
  | 'download'
  | 'publish_markup'
  | 'upload'
  | 'create_folder'
  | 'edit'
  | 'delete'
  | 'delete_folder'
  | 'manage_permissions';

/** Nivel efectivo leído de la base (asignación más cercana en la jerarquía). */
export interface DocumentLevel {
  /** El recurso está registrado y activo. */
  found: boolean;
  resourceId?: number | null;
  parentId?: number | null;
  /** Proyecto ACC al que pertenece el recurso, sin prefijo «b.». */
  project: string | null;
  level: number | null;
  code: string | null;
  /** Recurso que aporta el nivel (la propia carpeta o un antecesor). */
  origin: string | null;
}

/** Archivo al que pertenece una marca o foto del visor. */
export interface DocumentAnnotation {
  found: boolean;
  project: string | null;
  itemId: string | null;
}

/** Recurso documental registrado en GVR (accresources). */
export interface DocumentResource {
  found: boolean;
  externalId: string | null;
  type: string | null;
  project: string | null;
}

export interface DocumentAccessReader {
  level(userId: number, externalId: string): Promise<DocumentLevel>;
  isProjectMember(userId: number, projectId: string): Promise<boolean>;
  isIssueAssignee(userId: number, issueId: string): Promise<boolean>;
  annotation(kind: 'marca' | 'foto', id: number): Promise<DocumentAnnotation>;
  /** La revisión (y la referencia, si se indica) pertenece al proyecto. */
  reviewInProject(
    reviewId: number,
    projectId: string,
    referenceId?: number | null,
  ): Promise<boolean>;
  /** Por ID interno del recurso o, si no se indica, por ID de una asignación. */
  resource(
    resourceId: number | null,
    assignmentId?: number | null,
  ): Promise<DocumentResource>;
}

/** Jerarquía documental en Autodesk, consultada sólo cuando un recurso aún no está registrado. */
export interface DocumentHierarchy {
  parentOfItem(projectId: string, itemId: string): Promise<string | null>;
  parentOfFolder(projectId: string, folderId: string): Promise<string | null>;
}
