import type { IEmpresaRepository } from '../../../domain/repositories/empresa.repository.interface';
import { NotFoundError } from '../../errors/application.error';
import { MinioStoragePort } from '../../ports/minio-storage.port';

export class ObtenerEmpresaUseCase {
  constructor(
    private readonly empresaRepository: IEmpresaRepository,
    private readonly minioStorage: MinioStoragePort,
  ) {}

  async execute(idEmpresa: number) {
    const empresa = await this.empresaRepository.obtenerEmpresaPorId(idEmpresa);

    if (!empresa) {
      throw new NotFoundError('Empresa no encontrada');
    }

    const raw = empresa.urllogo != null ? String(empresa.urllogo).trim() : '';
    let urllogoviewurl: string | null = null;
    if (raw) {
      urllogoviewurl =
        await this.minioStorage.resolveViewUrlForEvidenciaStoredUrl(raw);
    }

    return { ...empresa, urllogoviewurl };
  }
}
