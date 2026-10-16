/**
 * Puerto: optimizar buffers de imágenes de evidencia antes de almacenar (MinIO).
 * Implementación: Sharp en `infrastructure/images`.
 */
export interface EvidenciaImageOptimizerInput {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export interface EvidenciaImageOptimizerResult {
  buffer: Buffer;
  mimetype: string;
  /** Mismo criterio que en multer: puede ajustar la extensión si se convierte de formato. */
  originalname: string;
}

export interface IEvidenciaImageOptimizer {
  /**
   * Redimensiona (lado largo) y recompone con calidad controlada.
   * No-imagen, SVG, GIF animado o error: devuelve el buffer original sin tocar nombres/MIME
   * (o los mismos que entraron).
   */
  optimizeForStorage(
    input: EvidenciaImageOptimizerInput,
  ): Promise<EvidenciaImageOptimizerResult>;
}

export const EVIDENCIA_IMAGE_OPTIMIZER = 'EVIDENCIA_IMAGE_OPTIMIZER';
