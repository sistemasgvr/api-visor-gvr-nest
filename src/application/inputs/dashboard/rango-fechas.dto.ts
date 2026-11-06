/**
 * Rango de fechas del periodo del dashboard, ya validado en la capa de presentación.
 * Campos ausentes = la función SQL aplica su periodo por defecto.
 */
export class RangoFechasDashboardDto {
  fechaInicio?: string;

  fechaFin?: string;
}
