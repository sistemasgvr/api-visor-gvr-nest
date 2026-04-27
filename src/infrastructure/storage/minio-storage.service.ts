import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  BadRequestException,
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
  buildEvidenciaObjectKey,
  sanitizeFilename,
  slugifyPathSegment,
} from './storage-path.util';

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

  constructor(private readonly config: ConfigService) {
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
    const encodedKey = key
      .split('/')
      .map((p) => encodeURIComponent(p))
      .join('/');
    if (this.publicBase) {
      return `${this.publicBase.replace(/\/$/, '')}/${encodedKey}`;
    }
    const endpoint = this.config.get<string>('MINIO_ENDPOINT')?.trim();
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
    if (!params.key || params.key.includes('..')) {
      throw new BadRequestException('Clave de objeto inválida');
    }
    await this.ensureBucket();

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType || 'application/octet-stream',
        CacheControl: params.cacheControl,
      }),
    );

    const publicUrl = this.buildPublicUrl(bucket, params.key);
    return {
      bucket,
      key: params.key,
      publicUrl,
      contentType: params.contentType || 'application/octet-stream',
      size: params.body.length,
    };
  }

  /**
   * Ruta estándar evidencias-actividades/usuarios/... con nombre de archivo único.
   */
  async uploadEvidenciaUsuarioActividad(params: {
    userId: number;
    userDisplayName: string;
    actividadId: number;
    actividadSlug: string;
    file: Express.Multer.File;
  }): Promise<UploadedObjectMeta> {
    const original = sanitizeFilename(params.file.originalname || 'archivo');
    const unique = `${Date.now()}-${randomUUID().slice(0, 8)}-${original}`;
    const key = buildEvidenciaObjectKey({
      userId: params.userId,
      userDisplayName: params.userDisplayName,
      actividadId: params.actividadId,
      actividadSlug: params.actividadSlug,
      filename: unique,
    });
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
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  }

  async getPresignedGetUrl(
    key: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    const { client, bucket } = this.requireClient();
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, cmd, { expiresIn: expiresInSeconds });
  }
}
