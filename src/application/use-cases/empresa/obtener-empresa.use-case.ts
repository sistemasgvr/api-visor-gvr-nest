import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IEmpresaRepository } from '../../../domain/repositories/empresa.repository.interface';
import { EMPRESA_REPOSITORY } from '../../../domain/repositories/empresa.repository.interface';
import { MinioStorageService } from '../../../infrastructure/storage/minio-storage.service';

@Injectable()
export class ObtenerEmpresaUseCase {
  constructor(
    @Inject(EMPRESA_REPOSITORY)
    private readonly empresaRepository: IEmpresaRepository,
    private readonly minioStorage: MinioStorageService,
  ) {}

  async execute(idEmpresa: number) {
    const empresa = await this.empresaRepository.obtenerEmpresaPorId(idEmpresa);

    if (!empresa) {
      throw new NotFoundException('Empresa no encontrada');
    }

    const raw =
      empresa.urllogo != null ? String(empresa.urllogo).trim() : '';
    let urllogoviewurl: string | null = null;
    if (raw) {
      urllogoviewurl =
        await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(raw);
    }

    return { ...empresa, urllogoviewurl };
  }
}
