import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import {
  ACC_RESOURCES_REPOSITORY,
  type IAccResourcesRepository,
} from '../../domain/repositories/acc-resources.repository.interface';
import {
  ACC_REPOSITORY,
  type IAccRepository,
} from '../../domain/repositories/acc.repository.interface';
import { normalizeExternalId } from '../../shared/utils/normalize-external-id.util';
import { AutodeskApiService } from './autodesk-api.service';
import {
  HTML_PDF_GENERATOR,
  type IHtmlPdfGenerator,
} from '../../domain/services/html-pdf-generator.interface';
import type { ExportarPermisosCarpetaPdfDto } from '../../application/dtos/data-management/folders/exportar-permisos-carpeta-pdf.dto';

const MAX_CARPETAS = 2000;
const MAX_FILAS = 5000;

type Fila = {
  carpeta: string;
  usuario: string;
  email: string;
  nivel: string;
};

function fmtFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return String(iso);
  }
}

@Injectable()
export class ExportacionPermisosCarpetaPdfService {
  constructor(
    @Inject(ACC_REPOSITORY)
    private readonly accRepository: IAccRepository,
    @Inject(ACC_RESOURCES_REPOSITORY)
    private readonly accResourcesRepository: IAccResourcesRepository,
    private readonly autodeskApiService: AutodeskApiService,
    @Inject(HTML_PDF_GENERATOR)
    private readonly htmlPdf: IHtmlPdfGenerator,
  ) {}

  async generarPdf(
    userId: number,
    projectId: string,
    folderId: string,
    dto: ExportarPermisosCarpetaPdfDto,
  ): Promise<Buffer> {
    if (dto.alcance === 'all_project_folders' && !dto.hubId?.trim()) {
      throw new BadRequestException(
        'hubId es requerido para exportar permisos de todas las carpetas del proyecto.',
      );
    }

    const token =
      await this.accRepository.obtenerToken3LeggedPorUsuario(userId);
    if (!token) {
      throw new ForbiddenException(
        'No se encontró token de acceso. Autoriza Autodesk primero.',
      );
    }
    if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
      throw new ForbiddenException('El token de Autodesk ha expirado.');
    }

    const { carpetas, truncated } = await this.recolectarCarpetasConNombre(
      token.tokenAcceso,
      projectId,
      folderId,
      dto,
    );
    const filas: Fila[] = [];
    for (const { id, nombreCarpeta } of carpetas) {
      if (filas.length >= MAX_FILAS) break;
      const rec = await this.accResourcesRepository.obtenerRecursoPorExternalId(
        normalizeExternalId(id) || id,
      );
      if (!rec?.id) continue;
      const ures = await this.accResourcesRepository.listarUsuariosRecurso(
        rec.id,
      );
      const us = ures.data || ures;
      const lista = Array.isArray(us) ? us : (us as { data?: unknown[] })?.data;
      if (!Array.isArray(lista)) continue;
      for (const u of lista) {
        if (filas.length >= MAX_FILAS) break;
        filas.push({
          carpeta: nombreCarpeta,
          usuario: String(
            (u as { nombreusuario?: string }).nombreusuario || '—',
          ),
          email: String((u as { emailusuario?: string }).emailusuario || '—'),
          nivel: String(
            (u as { permissionlevelname?: string }).permissionlevelname || '—',
          ),
        });
      }
    }

    const dmId = projectId.startsWith('b.') ? projectId : `b.${projectId}`;

    return this.htmlPdf.renderPdfFromTemplate(
      'docs-folder-permissions-report',
      {
        tituloReporte: dto.titulo,
        projectId: dmId,
        carpetaRef: folderId,
        alcance: dto.alcance,
        alcanceEtiqueta:
          dto.alcance === 'current_tree'
            ? 'Carpeta actual y subcarpetas'
            : 'Todas las carpetas del proyecto (carpetas principales y debajo)',
        fechaGeneracion: fmtFecha(new Date().toISOString()),
        totalAsignaciones: filas.length,
        carpetasRecorridas: carpetas.length,
        listadoParcial: truncated || filas.length >= MAX_FILAS,
        filas,
      },
      {
        format: 'A4',
        landscape: true,
        margin: { top: '10mm', right: '8mm', bottom: '10mm', left: '8mm' },
      },
    );
  }

  private async recolectarCarpetasConNombre(
    accessToken: string,
    projectId: string,
    startFolderId: string,
    dto: ExportarPermisosCarpetaPdfDto,
  ): Promise<{
    carpetas: { id: string; nombreCarpeta: string }[];
    truncated: boolean;
  }> {
    if (dto.alcance === 'current_tree') {
      return this.bfsCarpetas(
        accessToken,
        projectId,
        startFolderId,
        true,
        MAX_CARPETAS,
      );
    }

    const top = await this.autodeskApiService.obtenerCarpetasPrincipales(
      accessToken,
      dto.hubId!.trim(),
      projectId.startsWith('b.') ? projectId : `b.${projectId}`,
    );
    const data = top?.data || [];
    const out: { id: string; nombreCarpeta: string }[] = [];
    let truncated = false;
    for (const f of data) {
      if (f?.type === 'folders' && f.id) {
        const sub = await this.bfsCarpetas(
          accessToken,
          projectId,
          f.id,
          true,
          Math.max(0, MAX_CARPETAS - out.length),
        );
        for (const c of sub.carpetas) {
          if (out.length >= MAX_CARPETAS) {
            truncated = true;
            break;
          }
          out.push(c);
        }
        if (sub.truncated) truncated = true;
        if (out.length >= MAX_CARPETAS) {
          truncated = true;
          break;
        }
      }
    }
    if (out.length > 0) {
      return { carpetas: out, truncated };
    }
    return this.bfsCarpetas(
      accessToken,
      projectId,
      startFolderId,
      true,
      MAX_CARPETAS,
    );
  }

  private async bfsCarpetas(
    accessToken: string,
    projectId: string,
    rootId: string,
    incluirRaiz: boolean,
    maxCarpetas: number,
  ): Promise<{
    carpetas: { id: string; nombreCarpeta: string }[];
    truncated: boolean;
  }> {
    const cola: { id: string; ruta: string; nombre: string }[] = [];
    if (incluirRaiz) {
      const meta = await this.autodeskApiService
        .obtenerCarpetaPorId(accessToken, projectId, rootId)
        .catch(() => ({ data: null as unknown }));
      const m = (
        meta as {
          data?: { attributes?: { displayName?: string; name?: string } };
        }
      ).data;
      const nombre =
        m?.attributes?.displayName ||
        m?.attributes?.name ||
        rootId.slice(0, 12) + '…';
      cola.push({ id: rootId, ruta: '', nombre });
    }

    const resultado: { id: string; nombreCarpeta: string }[] = [];
    const visto = new Set<string>();
    let truncated = false;

    while (cola.length > 0 && resultado.length < maxCarpetas) {
      const cur = cola.shift()!;
      if (visto.has(cur.id)) continue;
      visto.add(cur.id);
      const nombreCarpeta = cur.ruta ? `${cur.ruta}/${cur.nombre}` : cur.nombre;
      resultado.push(conNombre(cur.id, nombreCarpeta));

      if (resultado.length >= maxCarpetas) {
        truncated = true;
        break;
      }

      const { data: subFolders } =
        await this.autodeskApiService.obtenerContenidoCarpetaTodasLasPaginas(
          accessToken,
          projectId,
          cur.id,
          { 'filter[type]': 'folders' },
        );

      for (const it of subFolders) {
        if (it.type === 'folders') {
          const nom =
            it.attributes?.displayName || it.attributes?.name || it.id;
          const nextRuta = cur.ruta ? `${cur.ruta}/${cur.nombre}` : cur.nombre;
          cola.push({ id: it.id, ruta: nextRuta, nombre: nom });
        }
      }
    }
    return { carpetas: resultado, truncated };
  }
}

function conNombre(
  id: string,
  nombreCarpeta: string,
): { id: string; nombreCarpeta: string } {
  return { id, nombreCarpeta };
}
