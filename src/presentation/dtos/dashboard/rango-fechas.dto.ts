import { IsDateString, IsOptional } from 'class-validator';

/**
 * Rango de fechas del selector de periodo del dashboard.
 *
 * Ambos campos son opcionales: si no llegan, cada función SQL aplica su periodo
 * por defecto (mes actual, o semana actual en los indicadores semanales).
 */
export class RangoFechasDashboardDto {
  /** Inicio del periodo (YYYY-MM-DD). */
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  /** Fin del periodo (YYYY-MM-DD), inclusivo. */
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
