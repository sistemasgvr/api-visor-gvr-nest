import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import archiver = require('archiver');
import { finished } from 'node:stream/promises';
import {
  ApplicationSettingsPort,
  LoggerFactoryPort,
  PasswordHasherPort,
  ZipArchivePort,
} from '../../application/ports/runtime.port';
import { buildCorsAllowedOrigins } from '../../config/cors-origins.util';
import {
  DOCS_CHUNK_SIGNED_URL_BATCH,
  DOCS_CHUNK_SIZE_BYTES,
} from '../../config/upload.constants';
import {
  getAccProjectImageMaxBytes,
  getAccProjectImageMaxLabel,
} from '../../config/acc-project-image.config';

@Injectable()
export class NestLoggerFactory extends LoggerFactoryPort {
  create(context: string) {
    return new Logger(context);
  }
}

@Injectable()
export class BcryptPasswordHasher extends PasswordHasherPort {
  compare(value: string, hash: string) {
    return bcrypt.compare(value, hash);
  }
  hash(value: string, rounds: number) {
    return bcrypt.hash(value, rounds);
  }
}

@Injectable()
export class EnvironmentApplicationSettings extends ApplicationSettingsPort {
  constructor(private readonly config: ConfigService) {
    super();
  }
  get frontendUrls() {
    return buildCorsAllowedOrigins(
      (this.config.get<string>('FRONTEND_URLS') ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    );
  }
  get docsChunkSizeBytes() {
    return DOCS_CHUNK_SIZE_BYTES;
  }
  get docsChunkSignedUrlBatch() {
    return DOCS_CHUNK_SIGNED_URL_BATCH;
  }
  getAccProjectImageMaxBytes() {
    return getAccProjectImageMaxBytes();
  }
  getAccProjectImageMaxLabel() {
    return getAccProjectImageMaxLabel();
  }
}

@Injectable()
export class ArchiverZipArchive extends ZipArchivePort {
  async create(
    files: Array<{ name: string; buffer: Buffer }>,
  ): Promise<Buffer> {
    const archive = archiver('zip', { zlib: { level: 6 } });
    const chunks: Buffer[] = [];
    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    for (const file of files) archive.append(file.buffer, { name: file.name });
    const endPromise = finished(archive);
    await archive.finalize();
    await endPromise;
    return Buffer.concat(chunks);
  }
}
