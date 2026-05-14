import { Injectable, Inject } from '@nestjs/common';
import type {
  IEmpresaRepository,
  ListarEmpresasParams,
} from '../../../domain/repositories/empresa.repository.interface';
import { EMPRESA_REPOSITORY } from '../../../domain/repositories/empresa.repository.interface';
import { MinioStorageService } from '../../../infrastructure/storage/minio-storage.service';

@Injectable()
export class ListarEmpresasUseCase {
  constructor(
    @Inject(EMPRESA_REPOSITORY)
    private readonly empresaRepository: IEmpresaRepository,
    private readonly minioStorage: MinioStorageService,
  ) {}

  async execute(params: ListarEmpresasParams) {
    const result = await this.empresaRepository.listarEmpresas(params);
    const rows = result?.data;
    if (!Array.isArray(rows) || rows.length === 0) {
      return result;
    }
    const data = await Promise.all(
      rows.map(async (row: Record<string, unknown>) => {
        const raw =
          row['urllogo'] != null ? String(row['urllogo']).trim() : '';
        if (!raw) {
          return { ...row, urllogoviewurl: null };
        }
        const urllogoviewurl =
          await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(raw);
        return { ...row, urllogoviewurl };
      }),
    );
    return { ...result, data };
  }
}
