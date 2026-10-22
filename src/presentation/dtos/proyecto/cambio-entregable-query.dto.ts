import { IsInt, Min, IsString, MaxLength, ValidateIf } from 'class-validator';
import { Type, Transform } from 'class-transformer';
export class CambioEntregableQueryDto {
  @ValidateIf((_o, v) => v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  revisionPlan?: number;
  @ValidateIf((_o, v) => v !== undefined)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(1000)
  motivo?: string;
}
