export interface ApplicationLogger {
  log(message: any, ...details: any[]): void;
  warn(message: any, ...details: any[]): void;
  error(message: any, ...details: any[]): void;
  debug(message: any, ...details: any[]): void;
  verbose(message: any, ...details: any[]): void;
}

export abstract class LoggerFactoryPort {
  abstract create(context: string): ApplicationLogger;
}

export abstract class PasswordHasherPort {
  abstract compare(value: string, hash: string): Promise<boolean>;
  abstract hash(value: string, rounds: number): Promise<string>;
}

export abstract class ConfigurationPort {
  abstract get<T = any>(key: string): T | undefined;
  abstract get<T = any>(key: string, defaultValue: T): T;
}

export interface TokenVerificationOptions {
  secret?: string;
  ignoreExpiration?: boolean;
}

export abstract class TokenServicePort {
  abstract sign(payload: Record<string, any>): string;
  abstract signAsync(payload: Record<string, any>): Promise<string>;
  abstract verify<T = any>(
    token: string,
    options?: TokenVerificationOptions,
  ): T;
  abstract verifyAsync<T = any>(
    token: string,
    options?: TokenVerificationOptions,
  ): Promise<T>;
}

export abstract class ApplicationSettingsPort {
  abstract readonly frontendUrls: string[];
  abstract readonly docsChunkSizeBytes: number;
  abstract readonly docsChunkSignedUrlBatch: number;
  abstract getAccProjectImageMaxBytes(): number;
  abstract getAccProjectImageMaxLabel(): string;
}

export abstract class ZipArchivePort {
  abstract create(
    files: Array<{ name: string; buffer: Buffer }>,
  ): Promise<Buffer>;
}
