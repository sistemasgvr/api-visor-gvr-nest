import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IAccRepository } from '../../../domain/repositories/acc.repository.interface';
import { ACC_REPOSITORY } from '../../../domain/repositories/acc.repository.interface';
import { AutodeskApiService } from '../../../infrastructure/services/autodesk-api.service';

export interface CronRefrescarTokensAccResult {
    total: number;
    refrescados: number;
    errores: number;
    detalles: { idUsuario: number; ok: boolean; error?: string }[];
}

/**
 * Use case para el cron que refresca todos los tokens ACC cada 55 minutos.
 * Lista tokens activos con refresh_token y refresca cada uno contra Autodesk.
 */
@Injectable()
export class CronRefrescarTokensAccUseCase {
    private readonly logger = new Logger(CronRefrescarTokensAccUseCase.name);

    constructor(
        @Inject(ACC_REPOSITORY)
        private readonly accRepository: IAccRepository,
        @Inject(AutodeskApiService)
        private readonly autodeskApiService: AutodeskApiService,
    ) {}

    async execute(): Promise<CronRefrescarTokensAccResult> {
        const tokens = await this.accRepository.listarTokensActivosParaRefresh();
        const detalles: { idUsuario: number; ok: boolean; error?: string }[] = [];
        let refrescados = 0;
        let errores = 0;

        for (const t of tokens) {
            try {
                const nuevoToken = await this.autodeskApiService.refrescarToken(t.tokenRefresco);
                await this.accRepository.actualizarToken3Legged(
                    t.id,
                    nuevoToken.access_token,
                    nuevoToken.refresh_token ?? t.tokenRefresco,
                    nuevoToken.expires_at,
                );
                detalles.push({ idUsuario: t.idUsuario, ok: true });
                refrescados++;
            } catch (err: any) {
                const msg = err?.message ?? String(err);
                this.logger.warn(`Cron refresh ACC: fallo usuario ${t.idUsuario}: ${msg}`);
                detalles.push({ idUsuario: t.idUsuario, ok: false, error: msg });
                errores++;
            }
        }

        return {
            total: tokens.length,
            refrescados,
            errores,
            detalles,
        };
    }
}
