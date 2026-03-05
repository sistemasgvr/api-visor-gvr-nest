import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { AutodeskApiService } from '../../../../infrastructure/services/autodesk-api.service';
import { ACC_REPOSITORY, type IAccRepository } from '../../../../domain/repositories/acc.repository.interface';
import { AUDITORIA_REPOSITORY, type IAuditoriaRepository } from '../../../../domain/repositories/auditoria.repository.interface';

@Injectable()
export class ObtenerVersionesUseCase {
    constructor(
        private readonly autodeskApiService: AutodeskApiService,
        @Inject(ACC_REPOSITORY)
        private readonly accRepository: IAccRepository,
        @Inject(AUDITORIA_REPOSITORY)
        private readonly auditoriaRepository: IAuditoriaRepository,
    ) { }

    async execute(userId: number, projectId: string, itemId: string, queryParams: any): Promise<any> {
        const token = await this.accRepository.obtenerToken3LeggedPorUsuario(userId);

        if (!token) {
            throw new UnauthorizedException('No se encontró token de acceso. Por favor, autoriza la aplicación primero.');
        }

        if (this.autodeskApiService.esTokenExpirado(token.expiraEn)) {
            throw new UnauthorizedException('El token ha expirado. Por favor, refresca tu token.');
        }

        const resultado = await this.autodeskApiService.obtenerVersionesItem(token.tokenAcceso, projectId, itemId);
        const items = resultado?.data ?? [];
        if (items.length === 0) return resultado;

        try {
            const auditorias = await this.auditoriaRepository.obtenerAuditoriasPorItemId(itemId);
            const getMeta = (a: any) => typeof a.metadatos === 'string' ? (() => { try { return JSON.parse(a.metadatos); } catch { return {}; } })() : (a.metadatos ?? {});
            const savesByVersion = (auditorias as any[])
                .filter((a) => a.accion === 'FILE_VERSION_SAVE' && getMeta(a).accVersionId)
                .reduce<Record<string, { usuario: string; empresa?: string; rol?: string }>>((map, a) => {
                    const versionId = getMeta(a).accVersionId;
                    if (versionId && !map[versionId]) {
                        map[versionId] = {
                            usuario: a.usuario ?? '—',
                            ...(a.empresa && { empresa: a.empresa }),
                            ...(a.rol && { rol: a.rol }),
                        };
                    }
                    return map;
                }, {});

            const dataEnriquecida = items.map((v: any) => {
                const audit = savesByVersion[v.id];
                if (!audit) return v;
                return {
                    ...v,
                    attributes: {
                        ...v.attributes,
                        createdByReal: audit.usuario,
                        lastModifiedByReal: audit.usuario,
                        ...(audit.empresa && { createdByRealEmpresa: audit.empresa }),
                        ...(audit.rol && { createdByRealRole: audit.rol }),
                    },
                };
            });

            return { ...resultado, data: dataEnriquecida };
        } catch {
            return resultado;
        }
    }
}
