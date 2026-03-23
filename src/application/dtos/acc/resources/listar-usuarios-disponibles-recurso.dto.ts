import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListarUsuariosDisponiblesRecursoDto {
    @IsOptional()
    @IsString()
    busqueda?: string = '';

    /** Máximo alineado con listados masivos (p. ej. combos de flujo de aprobación). */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(1000)
    limit?: number = 100;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;
}

