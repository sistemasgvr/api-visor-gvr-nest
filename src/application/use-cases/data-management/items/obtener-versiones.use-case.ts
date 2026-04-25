import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import {
  ACC_REPOSITORY,
  type IAccRepository,
} from '../../../../domain/repositories/acc.repository.interface';
import {
  AUDITORIA_REPOSITORY,
  type IAuditoriaRepository,
} from '../../../../domain/repositories/auditoria.repository.interface';

@Injectable()
export class ObtenerVersionesUseCase {
  constructor(
    private readonly autodeskApiService: AutodeskApiService,
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: IAuditoriaRepository,
  ) {}

  async execute(
    userId: number,
    projectId: string,
    itemId: string,
    queryParams: any,
  ): Promise<any> {
    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(userId);

    if (!token) {
      throw new UnauthorizedException(
        'No se encontró token de acceso. Por favor, autoriza la aplicación primero.',
      );
    }

    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new UnauthorizedException(
        'El token ha expirado. Por favor, refresca tu token.',
      );
    }

    const resultado = await this.autodeskApiService.obtenerVersionesItem(
      token.tokenAcceso,
      projectId,
      itemId,
    );
    const items = resultado?.data ?? [];
    if (items.length === 0) return resultado;

    try {
      const auditorias =
        await this.auditoriaRepository.obtenerAuditoriasPorItemId(itemId);
      const getMeta = (a: any): Record<string, any> => {
        const raw = a.metadatos;
        if (raw == null) return {};
        const obj =
          typeof raw === 'string'
            ? (() => {
                try {
                  return JSON.parse(raw);
                } catch {
                  return {};
                }
              })()
            : raw;
        return obj || {};
      };
      const fileVersionSaves = auditorias
        .filter((a) => a.accion === 'FILE_VERSION_SAVE')
        .map((a) => ({ ...a, meta: getMeta(a) }));

      const savesByVersionId: Record<
        string,
        { usuario: string; empresa?: string; rol?: string }
      > = {};
      for (const a of fileVersionSaves) {
        const versionId = a.meta?.accVersionId ?? a.meta?.accversionid;
        const idNorm = versionId ? String(versionId).trim() : '';
        const nombreUsuario =
          (
            a.meta?.nombreUsuario ??
            a.meta?.nombreusuario ??
            a.usuario ??
            '—'
          ).trim() || '—';
        if (idNorm && !savesByVersionId[idNorm]) {
          savesByVersionId[idNorm] = {
            usuario: nombreUsuario,
            ...(a.empresa && { empresa: a.empresa }),
            ...(a.rol && { rol: a.rol }),
          };
        }
      }

      const dataEnriquecida = items.map((v: any) => {
        const versionIdNorm = v.id ? String(v.id).trim() : '';
        let audit = versionIdNorm ? savesByVersionId[versionIdNorm] : null;

        if (!audit && fileVersionSaves.length > 0) {
          const sortedVersions = [...items].sort(
            (x, y) =>
              new Date(y.attributes?.lastModifiedTime || 0).getTime() -
              new Date(x.attributes?.lastModifiedTime || 0).getTime(),
          );
          const sortedAudits = [...fileVersionSaves].sort(
            (x, y) =>
              new Date(y.fechacreacion || 0).getTime() -
              new Date(x.fechacreacion || 0).getTime(),
          );
          const indexOfVersion = sortedVersions.findIndex(
            (x) => (x.id || '').trim() === versionIdNorm,
          );
          if (indexOfVersion >= 0 && sortedAudits[indexOfVersion]) {
            const a = sortedAudits[indexOfVersion];
            const nombreUsuario =
              (
                a.meta?.nombreUsuario ??
                a.meta?.nombreusuario ??
                a.usuario ??
                '—'
              ).trim() || '—';
            audit = {
              usuario: nombreUsuario,
              ...(a.empresa && { empresa: a.empresa }),
              ...(a.rol && { rol: a.rol }),
            };
          }
        }

        if (!audit) return v;
        return {
          ...v,
          attributes: {
            ...v.attributes,
            createdByReal: audit.usuario,
            lastModifiedByReal: audit.usuario,
            ...(audit.empresa && { createdByRealEmpresa: audit.empresa }),
            ...(audit.rol && { createdByRealRole: audit.rol }),
          },
        };
      });

      return { ...resultado, data: dataEnriquecida };
    } catch {
      return resultado;
    }
  }
}
