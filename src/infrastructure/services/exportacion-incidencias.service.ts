import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import archiver = require('archiver');
import axios from 'axios';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { ExportarIncidenciasDto } from '../../application/dtos/acc/issues/exportar-incidencias.dto';
import { ObtenerIncidenciasUseCase } from '../../application/use-cases/acc/issues/obtener-incidencias.use-case';
import { ObtenerIncidenciaPorIdUseCase } from '../../application/use-cases/acc/issues/obtener-incidencia-por-id.use-case';
import { ObtenerComentariosUseCase } from '../../application/use-cases/acc/issues/obtener-comentarios.use-case';
import { ObtenerAdjuntosUseCase } from '../../application/use-cases/acc/issues/obtener-adjuntos.use-case';
import { ObtenerPerfilUsuarioUseCase } from '../../application/use-cases/acc/issues/obtener-perfil-usuario.use-case';
import { AutodeskApiService } from './autodesk-api.service';
import ObtenerTokenValidoHelper from '../../application/use-cases/acc/issues/obtener-token-valido.helper';
import { USUARIOS_REPOSITORY } from '../../domain/repositories/usuarios.repository.interface';
import type { IUsuariosRepository } from '../../domain/repositories/usuarios.repository.interface';
import {
  AUDITORIA_REPOSITORY,
  type IAuditoriaRepository,
} from '../../domain/repositories/auditoria.repository.interface';
import {
  AUTH_REPOSITORY,
  type IAuthRepository,
} from '../../domain/repositories/auth.repository.interface';
import {
  HTML_PDF_GENERATOR,
  type IHtmlPdfGenerator,
} from '../../domain/services/html-pdf-generator.interface';
import { IssueReportMapper } from '../pdf/mappers/issue-report.mapper';
import { PdfTextHelper } from './pdf/helpers/pdf-text.helper';

@Injectable()
export class ExportacionIncidenciasService {
  private nombreProyecto: string = 'Nombre de proyecto';
  private usuarioCreador: string = '';
  private emailCreador: string = '';
  private fechaCreacion: Date = new Date();

  constructor(
    private readonly obtenerIncidenciasUseCase: ObtenerIncidenciasUseCase,
    private readonly obtenerIncidenciaPorIdUseCase: ObtenerIncidenciaPorIdUseCase,
    private readonly obtenerComentariosUseCase: ObtenerComentariosUseCase,
    private readonly obtenerAdjuntosUseCase: ObtenerAdjuntosUseCase,
    private readonly obtenerPerfilUsuarioUseCase: ObtenerPerfilUsuarioUseCase,
    private readonly autodeskApiService: AutodeskApiService,
    private readonly obtenerTokenValidoHelper: ObtenerTokenValidoHelper,
    private readonly configService: ConfigService,
    @Inject(USUARIOS_REPOSITORY)
    private readonly usuariosRepository: IUsuariosRepository,
    @Inject(AUDITORIA_REPOSITORY)
    private readonly auditoriaRepository: IAuditoriaRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(HTML_PDF_GENERATOR)
    private readonly htmlPdfGenerator: IHtmlPdfGenerator,
  ) {}

  async exportarPDF(
    userId: number,
    projectId: string,
    dto: ExportarIncidenciasDto,
  ): Promise<Buffer> {
    this.fechaCreacion = new Date();

    await this.obtenerNombreProyecto(userId, projectId);
    await this.obtenerInformacionUsuario(userId, projectId, dto);

    const incidenciasCompletas = await this.obtenerIncidenciasCompletas(
      userId,
      projectId,
      dto,
    );

    const { templateData, renderOptions } =
      await IssueReportMapper.toTemplateData({
        incidencias: incidenciasCompletas,
        nombreProyecto: this.nombreProyecto,
        usuarioCreador: this.usuarioCreador,
        emailCreador: this.emailCreador,
        fechaCreacion: this.fechaCreacion,
        dto,
        downloadImageCallback: (uid, pid, issueId, adjunto) =>
          this.descargarImagenAdjunto(uid, pid, issueId, adjunto),
        userId,
        projectId,
      });

    return this.htmlPdfGenerator.renderPdfFromTemplate(
      'acc-issues-report',
      templateData,
      renderOptions,
    );
  }

  private async obtenerNombreProyecto(
    userId: number,
    projectId: string,
  ): Promise<void> {
    try {
      const accessToken = await this.obtenerTokenValidoHelper.execute(userId);
      const hubsResponse =
        await this.autodeskApiService.obtenerHubs(accessToken);
      const hubs = hubsResponse.data || [];

      let nombreProyectoEncontrado = null;

      for (const hub of hubs) {
        try {
          const projectsResponse =
            await this.autodeskApiService.obtenerProyectos(accessToken, hub.id);
          const projects = projectsResponse.data || [];

          const proyecto = projects.find((p: any) => {
            const pId = p.id;
            const containerId = p.attributes?.extension?.data?.containerId;
            const cleanId = pId.startsWith('b.') ? pId.substring(2) : pId;
            const cleanProjectId = projectId.startsWith('b.')
              ? projectId.substring(2)
              : projectId;

            return (
              containerId === projectId ||
              cleanId === cleanProjectId ||
              pId === projectId
            );
          });

          if (proyecto) {
            nombreProyectoEncontrado =
              proyecto.attributes?.name ||
              proyecto.attributes?.displayName ||
              null;
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!nombreProyectoEncontrado) {
        for (const hub of hubs) {
          try {
            const proyectoData =
              await this.autodeskApiService.obtenerProyectoPorId(
                accessToken,
                hub.id,
                projectId,
              );
            if (proyectoData?.data) {
              nombreProyectoEncontrado =
                proyectoData.data.attributes?.name ||
                proyectoData.data.attributes?.displayName ||
                null;
              if (nombreProyectoEncontrado) break;
            }
          } catch (error) {
            continue;
          }
        }
      }

      this.nombreProyecto = nombreProyectoEncontrado || 'Nombre de proyecto';
    } catch (error) {
      this.nombreProyecto = 'Nombre de proyecto';
    }
  }

  private async obtenerInformacionUsuario(
    userId: number,
    projectId: string,
    dto: ExportarIncidenciasDto,
  ): Promise<void> {
    if (dto.usuarioNombre && dto.usuarioEmail) {
      this.usuarioCreador = dto.usuarioNombre;
      this.emailCreador = dto.usuarioEmail;
    } else {
      try {
        const perfilUsuario = await this.obtenerPerfilUsuarioUseCase.execute(
          userId,
          projectId,
        );
        this.usuarioCreador =
          perfilUsuario?.name ||
          perfilUsuario?.displayName ||
          'Usuario de la sesion';
        this.emailCreador = perfilUsuario?.email || '';
      } catch (error) {
        try {
          const usuarios =
            await this.usuariosRepository.obtenerUsuariosActivos();
          const usuario = usuarios.find(
            (u: any) => u.id === userId || u.idusuario === userId,
          );
          this.usuarioCreador =
            usuario?.nombre || usuario?.nombreusuario || 'Usuario de la sesion';
          this.emailCreador = usuario?.email || '';
        } catch (err) {
          this.usuarioCreador = 'Usuario de la sesion';
          this.emailCreador = '';
        }
      }
    }
  }

  private async obtenerIncidenciasCompletas(
    userId: number,
    projectId: string,
    dto: ExportarIncidenciasDto,
  ): Promise<any[]> {
    let incidencias: any[] = [];

    if (dto.tipoReporte === 'issue_detail' && dto.issueId) {
      try {
        const incidencia = await this.obtenerIncidenciaPorIdUseCase.execute(
          userId,
          projectId,
          dto.issueId,
        );
        if (incidencia) incidencias = [incidencia];
      } catch (error) {
        const resultado = await this.obtenerIncidenciasUseCase.execute(
          userId,
          projectId,
          {},
        );
        incidencias = this.extraerIncidencias(resultado);
      }
    } else {
      const filters: any = {};
      if (dto.filter_status) filters.filter_status = dto.filter_status;
      if (dto.filter_linkedDocumentUrn)
        filters.filter_linkedDocumentUrn = dto.filter_linkedDocumentUrn;

      const resultado = await this.obtenerIncidenciasUseCase.execute(
        userId,
        projectId,
        filters,
      );
      incidencias = this.extraerIncidencias(resultado);
    }

    // Ordenar por ID descendente
    incidencias.sort((a, b) => {
      const idA = parseInt(a.displayId || a.id || '0');
      const idB = parseInt(b.displayId || b.id || '0');
      return idB - idA;
    });

    // Obtener información completa de cada incidencia
    return await Promise.all(
      incidencias.map(async (incidencia) => {
        try {
          const [comentarios, adjuntos] = await Promise.all([
            this.obtenerComentariosUseCase
              .execute(userId, projectId, incidencia.id, {})
              .catch(() => ({ data: [] })),
            this.obtenerAdjuntosUseCase
              .execute(userId, projectId, incidencia.id, {})
              .catch(() => ({ data: [] })),
          ]);

          // Enriquecer comentarios con información del usuario de auditoría
          const comentariosEnriquecidos =
            await this.enriquecerComentariosConUsuario(comentarios?.data || []);

          return {
            ...incidencia,
            comentarios: comentariosEnriquecidos,
            adjuntos: adjuntos?.data || [],
          };
        } catch (error) {
          return { ...incidencia, comentarios: [], adjuntos: [] };
        }
      }),
    );
  }

  /**
   * Enriquece los comentarios con la información del usuario de auditoría (nombre, rol, foto de perfil)
   */
  private async enriquecerComentariosConUsuario(
    comentarios: any[],
  ): Promise<any[]> {
    if (!comentarios || comentarios.length === 0) {
      return [];
    }

    const comentariosEnriquecidos = await Promise.all(
      comentarios.map(async (comentario) => {
        try {
          const commentId = comentario.id;
          if (!commentId) return comentario;

          // Buscar la auditoría del comentario para obtener el usuario que lo creó
          const auditoria =
            await this.auditoriaRepository.obtenerAuditoriaPorMetadatos(
              'issue_comment',
              'COMMENT_CREATE',
              'accCommentId',
              commentId,
            );

          if (auditoria && auditoria.idusuario) {
            // Obtener la foto de perfil del usuario
            const perfilUsuario =
              await this.authRepository.obtenerPerfilUsuario(
                auditoria.idusuario,
              );

            let fotoPerfilBuffer: Buffer | null = null;
            if (perfilUsuario?.fotoperfil) {
              fotoPerfilBuffer = this.obtenerFotoPerfilBuffer(
                perfilUsuario.fotoperfil,
              );
            }

            return {
              ...comentario,
              gvrUsuario: {
                id: auditoria.idusuario,
                nombre: auditoria.usuario || perfilUsuario?.nombre,
                rol: auditoria.rol,
                fotoPerfil: perfilUsuario?.fotoperfil,
                fotoPerfilBuffer,
              },
            };
          }

          return comentario;
        } catch (error) {
          // Si hay error al enriquecer, devolver el comentario original
          return comentario;
        }
      }),
    );

    return comentariosEnriquecidos;
  }

  /**
   * Obtiene el buffer de la foto de perfil desde el sistema de archivos
   */
  private obtenerFotoPerfilBuffer(fotoPerfilPath: string): Buffer | null {
    try {
      if (!fotoPerfilPath) return null;

      // La ruta está guardada como 'profiles/1-123.jpg'
      const absolutePath = join(process.cwd(), 'uploads', fotoPerfilPath);

      if (existsSync(absolutePath)) {
        return readFileSync(absolutePath);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'Borrador',
      open: 'Abierto',
      pending: 'Pendiente',
      'in-progress': 'En Progreso',
      in_review: 'En revisión',
      closed: 'Cerrado',
    };
    return labels[status] || status;
  }

  private extraerIncidencias(resultado: any): any[] {
    if (resultado?.data?.results) {
      return resultado.data.results;
    } else if (resultado?.results) {
      return resultado.results;
    } else if (Array.isArray(resultado?.data)) {
      return resultado.data;
    } else if (Array.isArray(resultado)) {
      return resultado;
    }
    return [];
  }

  private async descargarImagenAdjunto(
    userId: number,
    projectId: string,
    issueId: string,
    adjunto: any,
  ): Promise<Buffer | null> {
    try {
      const accessToken = await this.obtenerTokenValidoHelper.execute(userId);

      // Si el adjunto tiene una URL directa
      if (adjunto.url || adjunto.downloadUrl || adjunto.download_url) {
        const url = adjunto.url || adjunto.downloadUrl || adjunto.download_url;
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        });
        return Buffer.from(response.data);
      }

      // Si tiene un URN (storageUrn, snapshotUrn, urn, thumbnailUrn), intentar obtener la URL firmada
      const urn =
        adjunto.storageUrn ||
        adjunto.snapshotUrn ||
        adjunto.urn ||
        adjunto.thumbnailUrn;
      if (urn) {
        const resultado = await this.autodeskApiService.obtenerUrlMiniatura(
          accessToken,
          urn,
        );
        if (resultado.success && resultado.url) {
          const response = await axios.get(resultado.url, {
            responseType: 'arraybuffer',
            timeout: 10000,
          });
          return Buffer.from(response.data);
        }
      }

      // Si tiene attachmentId, intentar obtener la URL de descarga desde el endpoint de attachments
      if (adjunto.attachmentId) {
        try {
          const baseUrl =
            this.configService.get<string>('AUTODESK_API_BASE_URL') ||
            'https://developer.api.autodesk.com';
          const normalizedProjectId = this.normalizarProjectId(projectId);
          const downloadUrl = `${baseUrl}/construction/issues/v1/projects/${encodeURIComponent(normalizedProjectId)}/attachments/${encodeURIComponent(issueId)}/items/${encodeURIComponent(adjunto.attachmentId)}/download`;

          const response = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            timeout: 10000,
          });
          return Buffer.from(response.data);
        } catch (error) {
          // Si falla, continuar con otros métodos
          console.warn('Error al descargar adjunto por attachmentId:', error);
        }
      }

      return null;
    } catch (error) {
      console.error('Error al descargar imagen adjunto:', error);
      return null;
    }
  }

  private normalizarProjectId(projectId: string): string {
    return projectId.startsWith('b.') ? projectId.substring(2) : projectId;
  }

  async exportarBCF(
    userId: number,
    projectId: string,
    dto: ExportarIncidenciasDto,
  ): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        let incidencias: any[] = [];

        if (dto.tipoReporte === 'issue_detail' && dto.issueId) {
          const incidencia = await this.obtenerIncidenciaPorIdUseCase.execute(
            userId,
            projectId,
            dto.issueId,
          );
          if (incidencia) {
            incidencias = [incidencia];
          }
        } else {
          const filters: any = {};
          if (dto.filter_status) {
            filters.filter_status = dto.filter_status;
          }
          if (dto.filter_linkedDocumentUrn) {
            filters.filter_linkedDocumentUrn = dto.filter_linkedDocumentUrn;
          }

          const resultado = await this.obtenerIncidenciasUseCase.execute(
            userId,
            projectId,
            filters,
          );
          incidencias = this.extraerIncidencias(resultado);
        }

        const archive = archiver('zip', { zlib: { level: 9 } });
        const chunks: Buffer[] = [];

        archive.on('data', (chunk) => chunks.push(chunk));
        archive.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);

        // Archivo de versión BCF
        archive.append('2.1', { name: 'bcf.version' });

        // Generar markup para cada incidencia
        incidencias.forEach((incidencia) => {
          const topicId = incidencia.id || `topic-${Date.now()}`;
          const topicDir = `${topicId}/`;

          const markup = this.generarMarkupBCF(incidencia);
          archive.append(markup, { name: `${topicDir}markup.bcf` });
        });

        archive.finalize();
      } catch (error) {
        reject(error);
      }
    });
  }

  private generarMarkupBCF(incidencia: any): string {
    const topicId = incidencia.id || `topic-${Date.now()}`;
    const markup = {
      topic: {
        guid: topicId,
        title: incidencia.title || 'Sin título',
        creationDate: incidencia.createdAt || new Date().toISOString(),
        modifiedDate: incidencia.updatedAt || new Date().toISOString(),
        description: incidencia.description || '',
        topicStatus: incidencia.status || 'open',
        topicType: incidencia.issueTypeId || 'Design',
        assignedTo: incidencia.assignedToReal || '',
      },
      comment: (incidencia.comentarios || []).map((c: any) => ({
        guid: c.id || `comment-${Date.now()}`,
        date: c.createdAt || new Date().toISOString(),
        author: c.createdByReal || c.createdBy || '',
        comment: PdfTextHelper.procesarTextoComentario(
          c.comment || c.body || '',
        ),
      })),
    };

    return JSON.stringify(markup, null, 2);
  }
}
