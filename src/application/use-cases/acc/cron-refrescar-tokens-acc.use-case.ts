import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IAccRepository } from '../../../domain/repositories/acc.repository.interface';
import { ACC_REPOSITORY } from '../../../domain/repositories/acc.repository.interface';
import { RefrescarToken3LeggedUseCase } from './refrescar-token-3legged.use-case';

export interface CronRefrescarTokensAccResult {
    total: number;
    refrescados: number;
    errores: number;
    detalles: { idUsuario: number; ok: boolean; error?: string }[];
}

/**
 * Use case para el cron que refresca todos los tokens ACC cada 55 minutos.
 * Usa la misma lógica que POST /acc/oauth/refresh: por cada usuario con token activo (estado=1),
 * llama a RefrescarToken3LeggedUseCase.execute(idUsuario), que obtiene el token con
 * obtenerToken3LeggedPorUsuario, refresca contra Autodesk y actualiza en BD.
 */
@Injectable()
export class CronRefrescarTokensAccUseCase {
    private readonly logger = new Logger(CronRefrescarTokensAccUseCase.name);

    constructor(
        @Inject(ACC_REPOSITORY)
        private readonly accRepository: IAccRepository,
        private readonly refrescarToken3LeggedUseCase: RefrescarToken3LeggedUseCase,
    ) {}

    async execute(): Promise<CronRefrescarTokensAccResult> {
        const tokens = await this.accRepository.listarTokensActivosParaRefresh();
        const userIds = [...new Set(tokens.map((t) => t.idUsuario))];
        const detalles: { idUsuario: number; ok: boolean; error?: string }[] = [];
        let refrescados = 0;
        let errores = 0;

        for (const idUsuario of userIds) {
            try {
                await this.refrescarToken3LeggedUseCase.execute(idUsuario);
                detalles.push({ idUsuario, ok: true });
                refrescados++;
            } catch (err: any) {
                const msg = err?.message ?? String(err);
                this.logger.warn(`Cron refresh ACC: fallo usuario ${idUsuario}: ${msg}`);
                detalles.push({ idUsuario, ok: false, error: msg });
                errores++;
            }
        }

        return {
            total: userIds.length,
            refrescados,
            errores,
            detalles,
        };
    }
}
