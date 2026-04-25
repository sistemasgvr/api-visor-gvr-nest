import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CollaboraService {
  private readonly logger = new Logger(CollaboraService.name);
  private readonly collaboraUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.collaboraUrl = this.configService.get<string>('COLLABORA_URL') || '';

    if (!this.collaboraUrl) {
      this.logger.warn('COLLABORA_URL no está configurada');
    } else {
      this.logger.log(`Collabora URL configurada: ${this.collaboraUrl}`);
    }
  }

  /**
   * Genera la URL de Collabora para abrir un documento
   * @param wopiSrcUrl URL del endpoint WOPI (debe apuntar a /wopi/files/{fileId})
   * @param mode Modo de edición: 'edit' o 'view'
   * @returns URL completa para el iframe de Collabora
   */
  generateCollaboraUrl(
    wopiSrcUrl: string,
    mode: 'edit' | 'view' = 'edit',
  ): string {
    if (!this.collaboraUrl) {
      throw new Error('COLLABORA_URL no está configurada');
    }

    // Formato WOPI estándar con idioma español:
    // https://collabora-server/browser/dist/cool.html?WOPISrc=<encoded_wopi_endpoint>&permission=<edit|view>&lang=es-ES
    // El WOPISrc debe apuntar al endpoint que implementa CheckFileInfo

    const encodedWopiSrc = encodeURIComponent(wopiSrcUrl);
    const browserUrl = `${this.collaboraUrl}/browser/dist/cool.html?WOPISrc=${encodedWopiSrc}&permission=${mode}&lang=es-ES`;

    this.logger.log(`URL de Collabora generada: ${browserUrl}`);

    return browserUrl;
  }

  /**
   * Obtiene el tipo de archivo para Collabora
   */
  private getFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';

    // Documentos de Word
    if (['doc', 'docx', 'odt', 'rtf'].includes(ext)) {
      return 'word';
    }

    // Hojas de cálculo
    if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) {
      return 'cell';
    }

    // Presentaciones
    if (['ppt', 'pptx', 'odp'].includes(ext)) {
      return 'impress';
    }

    // Por defecto, asumir documento
    return 'word';
  }

  /**
   * Verifica si Collabora está disponible
   */
  async checkCollaboraHealth(): Promise<boolean> {
    try {
      const discoveryUrl = `${this.collaboraUrl}/hosting/discovery`;
      const response = await fetch(discoveryUrl);
      return response.ok;
    } catch (error) {
      this.logger.error('Error al verificar salud de Collabora', error);
      return false;
    }
  }
}
