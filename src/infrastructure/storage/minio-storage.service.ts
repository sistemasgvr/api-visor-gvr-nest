import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import {
  buildEvidenciaArchivoObjectName,
  buildEvidenciaObjectKey,
  extensionDesdeArchivoEvidencia,
  isEvidenciaMinioObjectKey,
  normalizeS3ObjectKey,
  objectKeyFromStoredFileUrl,
  sanitizeFilename,
  slugifyPathSegment,
} from './storage-path.util';
import type { IEvidenciaImageOptimizer } from '../../domain/services/evidencia-image-optimizer.interface';
import { EVIDENCIA_IMAGE_OPTIMIZER } from '../../domain/services/evidencia-image-optimizer.interface';

export interface UploadedObjectMeta {
  bucket: string;
  key: string;
  /** URL pública si `MINIO_PUBLIC_BASE_URL` o el endpoint permiten lectura anónima. */
  publicUrl: string;
  contentType: string;
  size: number;
}

@Injectable()
export class MinioStorageService {
  private readonly logger = new Logger(MinioStorageService.name);
  private client: S3Client | null = null;
  private bucket: string | null = null;
  private publicBase: string | null = null;

  constructor(
    private readonly config: ConfigService,
    @Inject(EVIDENCIA_IMAGE_OPTIMIZER)
    private readonly evidenciaImageOptimizer: IEvidenciaImageOptimizer,
  ) {
    this.refreshFromConfig();
  }

  /** Relee env (útil en tests). */
  refreshFromConfig(): void {
    const endpoint =
      this.config.get<string>('MINIO_ENDPOINT')?.trim() ||
      this.config.get<string>('MINIO_SERVER_URL')?.trim();
    const accessKey =
      this.config.get<string>('MINIO_ACCESS_KEY')?.trim() ||
      this.config.get<string>('MINIO_ROOT_USER')?.trim();
    const secretKey =
      this.config.get<string>('MINIO_SECRET_KEY')?.trim() ||
      this.config.get<string>('MINIO_ROOT_PASSWORD')?.trim();
    const bucket = this.config.get<string>('MINIO_BUCKET')?.trim();
    const region =
      this.config.get<string>('MINIO_REGION')?.trim() || 'us-east-1';
    const forcePathStyle =
      (this.config.get<string>('MINIO_FORCE_PATH_STYLE') ?? 'true')
        .toLowerCase() !== 'false';

    const publicBase = this.config
      .get<string>('MINIO_PUBLIC_BASE_URL')
      ?.trim();

    if (!endpoint || !accessKey || !secretKey || !bucket) {
      this.client = null;
      this.bucket = null;
      this.publicBase = publicBase ?? null;
      return;
    }

    let origin: string;
    try {
      const u = new URL(endpoint);
      origin = u.origin;
    } catch {
      this.logger.warn(`MINIO_ENDPOINT / MINIO_SERVER_URL inválido: ${endpoint}`);
      this.client = null;
      this.bucket = null;
      this.publicBase = publicBase ?? null;
      return;
    }

    this.client = new S3Client({
      region,
      endpoint: origin,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle,
    });
    this.bucket = bucket;
    this.publicBase = publicBase?.replace(/\/$/, '') ?? null;
  }

  isConfigured(): boolean {
    return this.client !== null && !!this.bucket;
  }

  getBucketName(): string | null {
    return this.bucket;
  }

  /**
   * URL para el cliente: presignada (bucket privado) cuando la ruta apunta a objetos en
   * este MinIO; enlaces totalmente externos se dejan tal cual.
   */
  async resolveViewUrlForEvidenciaStoredUrl(
    stored: string,
    expiresInSeconds = 86_400,
  ): Promise<string> {
    const t = (stored ?? '').trim();
    if (!t) return t;
    const isHttp = /^https?:\/\//i.test(t);
    if (isHttp && !this.isLikelyOurMinioUrl(t)) {
      return t;
    }
    if (!this.isConfigured()) {
      return t;
    }
    const key = objectKeyFromStoredFileUrl(t, this.bucket);
    if (!key) return t;
    if (!isEvidenciaMinioObjectKey(key) && isHttp) {
      return t;
    }
    const exp = Math.min(Math.max(expiresInSeconds, 60), 7 * 24 * 3600);
    return this.getPresignedGetUrl(key, exp);
  }

  private isLikelyOurMinioUrl(urlStr: string): boolean {
    try {
      const u = new URL(urlStr);
      const pub = this.config.get<string>('MINIO_PUBLIC_BASE_URL')?.trim();
      if (pub) {
        return urlStr.startsWith(`${pub.replace(/\/$/, '')}/`);
      }
      const endpoint =
        this.config.get<string>('MINIO_ENDPOINT')?.trim() ||
        this.config.get<string>('MINIO_SERVER_URL')?.trim();
      if (endpoint) {
        return u.origin === new URL(endpoint).origin;
      }
    } catch {
      return false;
    }
    return false;
  }

  /**
   * Tras borrar el registro en BD: elimina el objeto en MinIO si la clave es de evidencias.
   * No lanza si el objeto ya no existe o la URL es externa.
   */
  async tryDeleteEvidenciaStoredObject(stored: string): Promise<void> {
    if (!this.isConfigured()) return;
    const key = objectKeyFromStoredFileUrl(stored, this.bucket);
    if (!key || !isEvidenciaMinioObjectKey(key)) return;
    try {
      await this.deleteObject(key);
    } catch (err: unknown) {
      this.logger.warn(`No se pudo eliminar objeto MinIO: ${key}`);
      this.logger.debug(err);
    }
  }

  private requireClient(): { client: S3Client; bucket: string } {
    if (!this.client || !this.bucket) {
      throw new ServiceUnavailableException(
        'Almacenamiento MinIO no está configurado. Defina MINIO_BUCKET y, además, (MINIO_ENDPOINT o MINIO_SERVER_URL) + (MINIO_ACCESS_KEY o MINIO_ROOT_USER) + (MINIO_SECRET_KEY o MINIO_ROOT_PASSWORD).',
      );
    }
    return { client: this.client, bucket: this.bucket };
  }

  /**
   * En S3/MinIO las “carpetas” son prefijos en la clave del objeto; no hace falta crearlas.
   * Solo aseguramos que el bucket exista.
   */
  async ensureBucket(): Promise<void> {
    const { client, bucket } = this.requireClient();
    try {
      await client.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch (err: unknown) {
      const status = (err as { $metadata?: { httpStatusCode?: number } })
        ?.$metadata?.httpStatusCode;
      const name = (err as { name?: string })?.name;
      if (status === 404 || name === 'NotFound') {
        await client.send(new CreateBucketCommand({ Bucket: bucket }));
        this.logger.log(`Bucket creado: ${bucket}`);
        return;
      }
      this.logger.error(`No se pudo comprobar/crear bucket ${bucket}`, err);
      throw new ServiceUnavailableException(
        'No se pudo acceder al bucket de MinIO.',
      );
    }
  }

  buildPublicUrl(bucket: string, key: string): string {
    const k = normalizeS3ObjectKey(key);
    const encodedKey = k
      .split('/')
      .map((p) => encodeURIComponent(p))
      .join('/');
    if (this.publicBase) {
      return `${this.publicBase.replace(/\/$/, '')}/${encodedKey}`;
    }
    const endpoint =
      this.config.get<string>('MINIO_ENDPOINT')?.trim() ||
      this.config.get<string>('MINIO_SERVER_URL')?.trim();
    if (!endpoint) return encodedKey;
    const origin = new URL(endpoint).origin.replace(/\/$/, '');
    return `${origin}/${bucket}/${encodedKey}`;
  }

  /**
   * Sube un buffer a una clave arbitraria (servicio general).
   */
  async putObject(params: {
    key: string;
    body: Buffer;
    contentType?: string;
    cacheControl?: string;
  }): Promise<UploadedObjectMeta> {
    const { client, bucket } = this.requireClient();
    const key = normalizeS3ObjectKey(params.key);
    if (!key || key.includes('..')) {
      throw new BadRequestException('Clave de objeto inválida');
    }
    await this.ensureBucket();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: params.body,
        ContentType: params.contentType || 'application/octet-stream',
        CacheControl: params.cacheControl,
      }),
    );

    const publicUrl = this.buildPublicUrl(bucket, key);
    return {
      bucket,
      key,
      publicUrl,
      contentType: params.contentType || 'application/octet-stream',
      size: params.body.length,
    };
  }

  /**
   * evidencias-actividades-gvr/{usuario}/2026-04-27/{objectName}
   * Con `indiceEvidencia` (≥1) el objectName es `{id}-Modulo Actividades (n).{ext}`.
   * Sin índice: `{idActividad}-{timestamp}-{uuid8}-{archivo}` (comportamiento anterior).
   */
  async uploadEvidenciaUsuarioActividad(params: {
    userId: number;
    userDisplayName: string;
    actividadId: number;
    /** Fecha de la jornada/actividad (YYYY-MM-DD) para la jerarquía por día en MinIO. */
    diaActividad: string;
    file: Express.Multer.File;
    /** Orden 1..n de la evidencia; si se envía, nombres alineados con genArchivo (Modulo Actividades). */
    indiceEvidencia?: number;
  }): Promise<UploadedObjectMeta> {
    const opt = await this.evidenciaImageOptimizer.optimizeForStorage({
      buffer: params.file.buffer,
      mimetype: params.file.mimetype || 'application/octet-stream',
      originalname: params.file.originalname || 'archivo',
    });
    if (!opt.buffer?.length) {
      throw new BadRequestException('Archivo vacío o no recibido');
    }
    const ext = extensionDesdeArchivoEvidencia(
      opt.originalname,
      opt.mimetype,
    );
    let objectName: string;
    if (
      params.indiceEvidencia != null &&
      Number.isFinite(params.indiceEvidencia) &&
      params.indiceEvidencia >= 1
    ) {
      const idx = Math.min(
        500,
        Math.max(1, Math.trunc(params.indiceEvidencia)),
      );
      objectName = buildEvidenciaArchivoObjectName(
        params.actividadId,
        idx,
        ext,
      );
    } else {
      const base = sanitizeFilename(opt.originalname || 'archivo');
      const unique = `${Date.now()}-${randomUUID().slice(0, 8)}`;
      objectName = `${params.actividadId}-${unique}-${base}`;
    }
    const key = buildEvidenciaObjectKey({
      userId: params.userId,
      userDisplayName: params.userDisplayName,
      diaActividad: params.diaActividad,
      objectName,
    });
    return this.putObject({
      key,
      body: opt.buffer,
      contentType: opt.mimetype || undefined,
    });
  }

  /**
   * Sube bajo un prefijo libre (p. ej. `documentos/contratos/`), creando “carpetas” virtuales.
   */
  async uploadUnderPrefix(params: {
    prefix: string;
    file: Express.Multer.File;
    /** Si no se envía, se usa el nombre sanitizado del archivo. */
    filename?: string;
  }): Promise<UploadedObjectMeta> {
    const prefix = (params.prefix ?? '')
      .replace(/^\/+|\/+$/g, '')
      .replace(/\.\./g, '');
    const slugPrefix = prefix
      .split('/')
      .map((s) => slugifyPathSegment(s, 100))
      .filter(Boolean)
      .join('/');
    const name = sanitizeFilename(
      params.filename ?? params.file.originalname ?? 'archivo',
    );
    const unique = `${Date.now()}-${randomUUID().slice(0, 8)}-${name}`;
    const key = slugPrefix ? `${slugPrefix}/${unique}` : unique;
    const body = params.file.buffer;
    if (!body?.length) {
      throw new BadRequestException('Archivo vacío o no recibido');
    }
    return this.putObject({
      key,
      body,
      contentType: params.file.mimetype || undefined,
    });
  }

  async deleteObject(key: string): Promise<void> {
    const { client, bucket } = this.requireClient();
    const k = normalizeS3ObjectKey(key);
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: k }));
  }

  async getPresignedGetUrl(
    key: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    const { client, bucket } = this.requireClient();
    const k = normalizeS3ObjectKey(key);
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: k });
    return getSignedUrl(client, cmd, { expiresIn: expiresInSeconds });
  }
}
