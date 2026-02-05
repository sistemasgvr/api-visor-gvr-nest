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
   * @param fileUrl URL del archivo a editar (debe ser accesible desde Collabora)
   * @param mode Modo de edición: 'edit' o 'view'
   * @returns URL completa para el iframe de Collabora
   */
  generateCollaboraUrl(fileUrl: string, mode: 'edit' | 'view' = 'edit'): string {
    if (!this.collaboraUrl) {
      throw new Error('COLLABORA_URL no está configurada');
    }

    // Generar URL de Collabora usando el protocolo correcto
    // Formato moderno: https://collabora-server/browser/<HASH>/cool.html?WOPISrc=<encoded_file_url>
    // Para compatibilidad, también soportamos el formato file_path
    
    // Usar el formato "browser" que es el más reciente en Collabora CODE
    const encodedFileUrl = encodeURIComponent(fileUrl);
    
    // Primero intentar el formato moderno (browser/cool.html)
    // Este formato funciona con Collabora CODE 23.05+
    const browserUrl = `${this.collaboraUrl}/browser/dist/cool.html?file_path=${encodedFileUrl}&permission=${mode}`;
    
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
