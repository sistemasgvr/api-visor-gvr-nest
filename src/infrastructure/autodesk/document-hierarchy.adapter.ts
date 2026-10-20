import { Inject, Injectable } from '@nestjs/common';
import type { DocumentHierarchy } from '../../application/ports/document-access.port';
import {
  ACC_REPOSITORY,
  type IAccRepository,
} from '../../domain/repositories/acc.repository.interface';
import { AutodeskApiService } from '../services/autodesk-api.service';

/** Ubica la carpeta contenedora en Autodesk con el token de integración vigente. */
@Injectable()
export class DocumentHierarchyAdapter implements DocumentHierarchy {
  constructor(
    private readonly autodesk: AutodeskApiService,
    @Inject(ACC_REPOSITORY) private readonly acc: IAccRepository,
  ) {}

  async parentOfItem(projectId: string, itemId: string) {
    const token = await this.token();
    return this.idOf(
      await this.autodesk.obtenerItemPadre(token, projectId, itemId),
    );
  }

  async parentOfFolder(projectId: string, folderId: string) {
    const token = await this.token();
    return this.idOf(
      await this.autodesk.obtenerCarpetaPadre(token, projectId, folderId),
    );
  }

  private async token() {
    const token = await this.acc.obtenerToken3LeggedPorUsuario(0);
    if (!token || this.autodesk.esTokenExpirado(token.expiraEn))
      throw new Error('Integración con Autodesk no disponible');
    return token.tokenAcceso;
  }

  private idOf(response: unknown): string | null {
    const data = (response as { data?: { id?: unknown; type?: unknown } })
      ?.data;
    return typeof data?.id === 'string' && data.type === 'folders'
      ? data.id
      : null;
  }
}
