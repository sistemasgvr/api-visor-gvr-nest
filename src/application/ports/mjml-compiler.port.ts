/** Contrato de aplicación; la implementación y su configuración pertenecen a infraestructura. */
export interface MjmlCompileResult {
  html: string;
  errors: string[];
}

export abstract class MjmlCompilerPort {
  abstract compile(mjmlSource: string): Promise<MjmlCompileResult>;
  abstract compileOptional(mjmlSource?: string | null): Promise<string | null>;
  abstract looksLikeMjml(source: string): boolean;
  abstract looksLikeHtml(source: string): boolean;
}
