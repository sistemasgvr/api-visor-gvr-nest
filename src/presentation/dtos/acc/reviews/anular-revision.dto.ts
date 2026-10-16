import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AnularRevisionDto {
  /**
   * Notas / motivo de anulación (como en ACC: el usuario escribe una nota).
   * Opcional, pero si se envía debe ser texto.
   */
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notas?: string;
}
