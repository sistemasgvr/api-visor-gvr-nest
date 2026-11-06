import {
  DocumentAccessService,
  documentItemId,
} from './document-access.service';
import { AuthorizationService } from './authorization.service';
import type {
  DocumentAccessReader,
  DocumentHierarchy,
  DocumentLevel,
} from '../ports/document-access.port';
import type { AuthorizationSnapshot } from '../ports/authorization.port';
import {
  issuePolicies,
  projectPolicies,
  securityPolicies,
} from '../../composition/modules/platform/authorization.module';

const PROJECT = 'p-1';
const level = (value: Partial<DocumentLevel>): DocumentLevel => ({
  found: true,
  project: PROJECT,
  level: null,
  code: null,
  origin: null,
  ...value,
});

describe('Documentos BIM por nivel de proyecto/carpeta (sin SQL)', () => {
  let snapshot: AuthorizationSnapshot;
  let levels: Record<string, DocumentLevel>;
  let parents: Record<string, string | null>;
  let members: Set<string>;
  let assignees: Set<string>;
  let reader: DocumentAccessReader;
  let hierarchy: DocumentHierarchy;
  let service: DocumentAccessService;
  let authorization: AuthorizationService;

  beforeEach(() => {
    snapshot = { active: true, grants: [] };
    levels = {};
    parents = {};
    members = new Set();
    assignees = new Set();
    reader = {
      level: jest.fn(
        async (_user, id) =>
          levels[id] ?? {
            found: false,
            project: null,
            level: null,
            code: null,
            origin: null,
          },
      ),
      isProjectMember: jest.fn(async (user, project) =>
        members.has(`${user}:${project}`),
      ),
      isIssueAssignee: jest.fn(async (user, issue) =>
        assignees.has(`${user}:${issue}`),
      ),
      resource: jest.fn(async () => ({
        found: false,
        externalId: null,
        type: null,
        project: null,
      })),
      annotation: jest.fn(async () => ({
        found: false,
        project: null,
        itemId: null,
      })),
      reviewInProject: jest.fn(async () => false),
    };
    hierarchy = {
      parentOfItem: jest.fn(async (_p, item) => parents[item] ?? null),
      parentOfFolder: jest.fn(async (_p, folder) => parents[folder] ?? null),
    };
    const policies = new Map([
      ...securityPolicies(),
      ...issuePolicies(reader, { readCurrent: async () => snapshot }),
      ...projectPolicies(reader),
    ]);
    authorization = new AuthorizationService(
      { readCurrent: async () => snapshot },
      policies,
    );
    service = new DocumentAccessService(reader, hierarchy, authorization);
  });

  it('descarga sólo con nivel «Ver y descargar» o superior en la carpeta del archivo', async () => {
    parents['item-1'] = 'folder-a';
    levels['folder-a'] = level({ level: 1, code: 'view' });
    await expect(
      service.assertItem(7, PROJECT, 'item-1', 'view'),
    ).resolves.toBeUndefined();
    await expect(
      service.assertItem(7, PROJECT, 'item-1', 'download'),
    ).rejects.toMatchObject({ kind: 'forbidden' });
    levels['folder-a'] = level({ level: 2, code: 'view_download' });
    await expect(
      service.assertItem(7, PROJECT, 'item-1', 'download'),
    ).resolves.toBeUndefined();
  });

  it('sin asignación en la jerarquía se deniega incluso la consulta', async () => {
    levels['folder-a'] = level({ level: null });
    await expect(
      service.assertFolder(7, PROJECT, 'folder-a', 'view'),
    ).rejects.toMatchObject({ kind: 'forbidden' });
  });

  it('una carpeta de otro proyecto no autoriza la ruta de este proyecto', async () => {
    levels['folder-x'] = level({ project: 'otro', level: 6, code: 'admin' });
    await expect(
      service.assertFolder(7, PROJECT, 'folder-x', 'view'),
    ).rejects.toMatchObject({ kind: 'forbidden' });
  });

  it('una carpeta sin registrar hereda de su padre en Autodesk y, al final, del proyecto', async () => {
    parents['nueva'] = 'folder-a';
    levels['folder-a'] = level({ level: 4, code: 'create_upload' });
    const access = await service.forFolder(7, `b.${PROJECT}`, 'nueva');
    expect(access.capabilities.upload).toBe(true);
    expect(access.capabilities.edit).toBe(false);

    parents['raiz'] = null;
    levels[PROJECT] = level({ level: 2, code: 'view_download' });
    const root = await service.forFolder(7, PROJECT, 'raiz');
    expect(root.capabilities.download).toBe(true);
  });

  it('si Autodesk falla al ubicar el archivo se deniega', async () => {
    (hierarchy.parentOfItem as jest.Mock).mockRejectedValueOnce(
      new Error('APS'),
    );
    await expect(
      service.assertItem(7, PROJECT, 'item-1', 'view'),
    ).rejects.toMatchObject({ kind: 'forbidden' });
  });

  it('el acceso total por rol reemplaza al rol Administrador fijo', async () => {
    snapshot.grants = [
      { code: 'gestion_bim.documentos.acceso_total', scopes: ['global'] },
    ];
    const access = await service.forFolder(7, PROJECT, 'cualquiera');
    expect(access.fullAccess).toBe(true);
    expect(Object.values(access.capabilities).every(Boolean)).toBe(true);
    expect(reader.level).not.toHaveBeenCalled();
  });

  it('«ver todos» da sólo nivel Ver donde no hay asignación y no rebaja una asignación mayor', async () => {
    snapshot.grants = [
      { code: 'gestion_bim.documentos.ver_todos', scopes: ['global'] },
    ];
    levels['folder-a'] = level({ level: null });
    const sinAsignacion = await service.forFolder(7, PROJECT, 'folder-a');
    expect(sinAsignacion.capabilities.view).toBe(true);
    expect(sinAsignacion.capabilities.download).toBe(false);
    levels['folder-a'] = level({ level: 4, code: 'create_upload' });
    const asignado = await service.forFolder(7, PROJECT, 'folder-a');
    expect(asignado.capabilities.upload).toBe(true);
    await expect(
      service.assertProjectMember(7, 'cualquier-proyecto'),
    ).resolves.toBeUndefined();
  });

  it('«Configurar proyecto» por rol gestiona permisos sin dar más acciones sobre documentos', async () => {
    levels[PROJECT] = level({ level: 2, code: 'view_download' });
    await expect(service.assertProjectAdmin(7, PROJECT)).rejects.toMatchObject({
      kind: 'forbidden',
    });
    snapshot.grants = [
      { code: 'gestion_bim.proyectos.configurar', scopes: ['asignados'] },
    ];
    members.add(`7:${PROJECT}`);
    const access = await service.forFolder(7, PROJECT, null);
    expect(access.capabilities.manage_permissions).toBe(true);
    expect(access.capabilities.delete_folder).toBe(false);
    expect(access.capabilities.edit).toBe(false);
    expect(access.capabilities.download).toBe(true);
    await expect(
      service.assertProjectAdmin(7, PROJECT),
    ).resolves.toBeUndefined();
    members.clear();
    await expect(service.assertProjectAdmin(7, PROJECT)).rejects.toMatchObject({
      kind: 'forbidden',
    });
  });

  it('gestionar accesos exige «Administrar» en el recurso', async () => {
    (reader.resource as jest.Mock).mockResolvedValue({
      found: true,
      externalId: 'folder-a',
      type: 'folder',
      project: PROJECT,
    });
    levels['folder-a'] = level({ level: 5, code: 'edit' });
    await expect(
      service.assertResource(7, { resourceId: 3 }, 'manage_permissions'),
    ).rejects.toMatchObject({ kind: 'forbidden' });
    levels['folder-a'] = level({ level: 6, code: 'admin' });
    await expect(
      service.assertResource(7, { assignmentId: 9 }, 'manage_permissions'),
    ).resolves.toBeUndefined();
  });

  it('registrar una carpeta bajo un padre falso se rechaza', async () => {
    (reader.resource as jest.Mock).mockResolvedValue({
      found: true,
      externalId: 'folder-admin',
      type: 'folder',
      project: PROJECT,
    });
    levels['folder-admin'] = level({ level: 6, code: 'admin' });
    parents['restringida'] = 'folder-real';
    await expect(
      service.assertRegistration(7, {
        externalId: 'restringida',
        type: 'folder',
        parentId: 3,
      }),
    ).rejects.toMatchObject({ kind: 'forbidden' });
    parents['restringida'] = 'folder-admin';
    await expect(
      service.assertRegistration(7, {
        externalId: 'restringida',
        type: 'folder',
        parentId: 3,
      }),
    ).resolves.toBeUndefined();
  });

  it('reconoce el documento del visor (base64), la versión o el ítem', () => {
    const item = 'urn:adsk.wipprod:dm.lineage:0y7wZgkKT6GQVirGp2niVg';
    const version =
      'urn:adsk.wipprod:fs.file:vf.0y7wZgkKT6GQVirGp2niVg?version=1';
    const viewer =
      'urn:' + Buffer.from(version).toString('base64').replace(/=+$/, '');
    expect(documentItemId(item)).toBe(item);
    expect(documentItemId(version)).toBe(item);
    expect(documentItemId(viewer)).toBe(item);
    expect(documentItemId('urn:adsk.objects:os.object:bucket/archivo')).toBe(
      null,
    );
    expect(documentItemId('')).toBe(null);
  });

  it('el visor sólo opera documentos de carpetas que la persona puede ver', async () => {
    const item = 'urn:adsk.wipprod:dm.lineage:abc';
    parents[item] = 'folder-a';
    levels['folder-a'] = level({ level: 1, code: 'view' });
    await expect(
      service.assertDocument(
        7,
        PROJECT,
        'urn:adsk.wipprod:fs.file:vf.abc?version=3',
        'view',
      ),
    ).resolves.toBeUndefined();
    await expect(
      service.assertDocument(7, PROJECT, 'texto-cualquiera', 'view'),
    ).rejects.toMatchObject({ kind: 'forbidden' });
  });

  it('una marca se autoriza con el archivo y el proyecto al que pertenece', async () => {
    const item = 'urn:adsk.wipprod:dm.lineage:abc';
    parents[item] = 'folder-a';
    levels['folder-a'] = level({ level: 2, code: 'view_download' });
    (reader.annotation as jest.Mock).mockResolvedValue({
      found: true,
      project: PROJECT,
      itemId: item,
    });
    await expect(
      service.assertAnnotation(7, PROJECT, 'marca', 4, 'view'),
    ).resolves.toBeUndefined();
    await expect(
      service.assertAnnotation(7, PROJECT, 'marca', 4, 'publish_markup'),
    ).rejects.toMatchObject({ kind: 'forbidden' });
    await expect(
      service.assertAnnotation(7, 'otro-proyecto', 'marca', 4, 'view'),
    ).rejects.toMatchObject({ kind: 'forbidden' });
  });

  it('revisiones: miembro del proyecto; anular o saltar pasos exige administrar', async () => {
    await expect(service.assertProjectMember(7, PROJECT)).rejects.toMatchObject(
      { kind: 'forbidden' },
    );
    members.add(`7:${PROJECT}`);
    await expect(
      service.assertProjectMember(7, `b.${PROJECT}`),
    ).resolves.toBeUndefined();
    levels[PROJECT] = level({ level: 5, code: 'edit' });
    await expect(service.assertProjectAdmin(7, PROJECT)).rejects.toMatchObject({
      kind: 'forbidden',
    });
    levels[PROJECT] = level({ level: 6, code: 'admin' });
    await expect(
      service.assertProjectAdmin(7, PROJECT),
    ).resolves.toBeUndefined();
  });

  it('no se opera una revisión de otro proyecto con sólo su ID', async () => {
    await expect(
      service.assertReviewInProject(PROJECT, '3'),
    ).rejects.toMatchObject({ kind: 'forbidden' });
    (reader.reviewInProject as jest.Mock).mockResolvedValue(true);
    await expect(
      service.assertReviewInProject(PROJECT, '3', 9),
    ).resolves.toBeUndefined();
    expect(reader.reviewInProject).toHaveBeenLastCalledWith(3, PROJECT, 9);
    await expect(
      service.assertReviewInProject(PROJECT, 'abc'),
    ).rejects.toMatchObject({ kind: 'forbidden' });
  });

  describe('proyectos BIM por rol', () => {
    const can = (action: string, id: string | null) =>
      authorization.can(
        7,
        `gestion_bim.proyectos.${action}`,
        id === null ? null : { type: 'acc_project', id },
      );

    it('crear y clonar son globales; sin el permiso del rol se niegan', async () => {
      expect(await can('crear', null)).toBe(false);
      snapshot.grants = [
        { code: 'gestion_bim.proyectos.crear', scopes: ['global'] },
      ];
      expect(await can('crear', null)).toBe(true);
      expect(await can('clonar', null)).toBe(false);
    });

    it('«asignados» edita sólo proyectos donde participa; «todos» cualquiera y el listado completo', async () => {
      snapshot.grants = [
        { code: 'gestion_bim.proyectos.editar', scopes: ['asignados'] },
        { code: 'gestion_bim.proyectos.ver', scopes: ['asignados'] },
      ];
      members.add(`7:${PROJECT}`);
      expect(await can('editar', `b.${PROJECT}`)).toBe(true);
      expect(await can('editar', 'otro')).toBe(false);
      expect(await can('ver', '*')).toBe(false);
      snapshot.grants = [
        { code: 'gestion_bim.proyectos.ver', scopes: ['todos'] },
      ];
      expect(await can('ver', '*')).toBe(true);
      expect(await can('ver', 'otro')).toBe(true);
    });
  });

  describe('incidencias por rol', () => {
    const can = (action: string, id: string) =>
      authorization.can(7, `gestion_bim.incidencias.${action}`, {
        type: 'acc_issue',
        id,
      });

    it('«asignados» sólo alcanza incidencias asignadas en proyectos donde participa', async () => {
      snapshot.grants = [
        { code: 'gestion_bim.incidencias.ver', scopes: ['asignados'] },
      ];
      members.add(`7:${PROJECT}`);
      assignees.add('7:issue-1');
      expect(await can('ver', `${PROJECT}/issue-1`)).toBe(true);
      expect(await can('ver', `${PROJECT}/issue-2`)).toBe(false);
      expect(await can('ver', PROJECT)).toBe(true);
      expect(await can('ver', `${PROJECT}/*`)).toBe(false);
      members.clear();
      expect(await can('ver', `${PROJECT}/issue-1`)).toBe(false);
    });

    it('«todos» alcanza cualquier incidencia de sus proyectos, no de otros', async () => {
      snapshot.grants = [
        { code: 'gestion_bim.incidencias.editar', scopes: ['todos'] },
      ];
      members.add(`7:${PROJECT}`);
      expect(await can('editar', `${PROJECT}/issue-9`)).toBe(true);
      expect(await can('editar', `${PROJECT}/*`)).toBe(true);
      expect(await can('editar', 'otro/issue-9')).toBe(false);
    });

    it('con acceso total a documentos el ámbito son todos los proyectos', async () => {
      snapshot.grants = [
        { code: 'gestion_bim.incidencias.ver', scopes: ['todos'] },
        { code: 'gestion_bim.documentos.acceso_total', scopes: ['global'] },
      ];
      expect(await can('ver', 'otro/issue-9')).toBe(true);
    });

    it('sin la acción en el rol no hay acceso aunque participe', async () => {
      members.add(`7:${PROJECT}`);
      assignees.add('7:issue-1');
      expect(await can('comentar', `${PROJECT}/issue-1`)).toBe(false);
    });
  });
});
