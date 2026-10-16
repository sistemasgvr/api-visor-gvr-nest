import type {
  CronCierreJornadasResult,
  IControlOperativoRepository,
} from '../../../domain/repositories/control-operativo.repository.interface';

export class CronCierreJornadasUseCase {
  constructor(
    private readonly controlOperativoRepository: IControlOperativoRepository,
  ) {}

  /**
   * Ejecuta el cron de cierre: Alertas para quien no abrió; jornadas pasados días de tolerancia
   * con actividades → Cerrado, sin actividades → Incompleto.
   */
  async execute(fecha: string): Promise<CronCierreJornadasResult> {
    const f = fecha?.trim();
    if (!f || !/^\d{4}-\d{2}-\d{2}$/.test(f)) {
      throw new Error('Fecha inválida; use formato YYYY-MM-DD');
    }
    return this.controlOperativoRepository.ejecutarCronCierreJornadas(f);
  }
}
