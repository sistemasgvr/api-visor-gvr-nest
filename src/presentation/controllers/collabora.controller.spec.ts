import { CollaboraController } from './collabora.controller';
import { DocumentAccessService } from '../../application/services/document-access.service';
import { AuthorizationService } from '../../application/services/authorization.service';
import { DocumentHierarchyAdapter } from '../../infrastructure/autodesk/document-hierarchy.adapter';
import { ForbiddenError } from '../../application/errors/application.error';
import type { DocumentAccessReader } from '../../application/ports/document-access.port';

describe('Apertura de Collabora por nivel documental', () => {
  let controller: CollaboraController;
  let assignedLevel: number | null;
  let autodesk: any;
  let tokens: any;
  const request = { user: { sub: 7 } };

  beforeEach(() => {
    assignedLevel = 1;
    const acc = {
      obtenerToken3LeggedPorUsuario: jest.fn(async () => ({
        tokenAcceso: 'acc-token',
        expiraEn: new Date('2099-01-01'),
      })),
    };
    autodesk = {
      esTokenExpirado: jest.fn(() => false),
      obtenerItemPadre: jest.fn(async (_token, project) => {
        if (project !== 'b.project') throw new Error('Proyecto ACC inválido');
        return { data: { id: 'folder', type: 'folders' } };
      }),
      obtenerCarpetaPadre: jest.fn(async (_token, project) => {
        if (project !== 'b.project') throw new Error('Proyecto ACC inválido');
        return { data: null };
      }),
      obtenerStorageUrl: jest.fn(async () => ({
        storageUrl: 'https://storage.example/document',
        fileName: 'document.docx',
      })),
    };
    const reader = {
      level: jest.fn(async (_user, externalId) => ({
        found: externalId === 'project',
        project: externalId === 'project' ? 'project' : null,
        level: externalId === 'project' ? assignedLevel : null,
        code: null,
        origin: null,
      })),
    } as unknown as DocumentAccessReader;
    // Ningún permiso granular ni acceso total: sólo la asignación del proyecto BIM.
    const authorization = new AuthorizationService(
      { readCurrent: async () => ({ active: true, grants: [] }) },
      new Map(),
    );
    const access = new DocumentAccessService(
      reader,
      new DocumentHierarchyAdapter(autodesk, acc as any),
      authorization,
    );
    tokens = {
      generateStableDocId: jest.fn(() => 'doc-id'),
      createUserSessionToken: jest.fn(() => 'session-token'),
    };
    controller = new CollaboraController(
      access,
      {
        generateCollaboraUrl: jest.fn(
          (_src, mode) => `https://collabora.example/${mode}`,
        ),
      } as any,
      autodesk,
      tokens,
      {} as any,
      acc as any,
      {} as any,
      {} as any,
      {} as any,
    );
  });

  it.each([1, 2, 3, 4, 5, 6])(
    'abre con nivel %i sin permiso granular',
    async (level) => {
      assignedLevel = level;
      const mode = level >= 5 ? 'edit' : 'view';
      const result = await controller.getCollaboraConfig(
        'project',
        'item',
        undefined,
        undefined,
        request,
      );
      expect(result).toMatchObject({
        status: 200,
        data: { collaboraUrl: `https://collabora.example/${mode}` },
      });
      expect(tokens.createUserSessionToken).toHaveBeenCalledWith(
        7,
        'project',
        'item',
        'document.docx',
        480,
        'acc-token',
        undefined,
        mode,
      );
      expect(autodesk.obtenerItemPadre).toHaveBeenCalledWith(
        'acc-token',
        'b.project',
        'item',
      );
      expect(autodesk.obtenerCarpetaPadre).toHaveBeenCalledWith(
        'acc-token',
        'b.project',
        'folder',
      );
    },
  );

  it('conserva el prefijo b. y respeta la apertura explícita en lectura', async () => {
    assignedLevel = 6;
    const result = await controller.getCollaboraConfig(
      'b.project',
      'item',
      undefined,
      'view',
      request,
    );
    expect(result).toMatchObject({
      status: 200,
      data: { collaboraUrl: 'https://collabora.example/view' },
    });
  });

  it('pedir edición no eleva el nivel Ver y descargar', async () => {
    assignedLevel = 2;
    const result = await controller.getCollaboraConfig(
      'project',
      'item',
      undefined,
      'edit',
      request,
    );
    expect(result).toMatchObject({
      status: 200,
      data: { collaboraUrl: 'https://collabora.example/view' },
    });
  });

  it('sin asignación deniega sin ocultar el motivo ni emitir sesión WOPI', async () => {
    assignedLevel = null;
    await expect(
      controller.getCollaboraConfig(
        'project',
        'item',
        undefined,
        undefined,
        request,
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(tokens.createUserSessionToken).not.toHaveBeenCalled();
    expect(autodesk.obtenerStorageUrl).not.toHaveBeenCalled();
  });
});
