import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListarUsuariosDisponiblesRecursoDto {
    @IsOptional()
    @IsString()
    busqueda?: string = '';

    /** Listados masivos (p. ej. agregar usuarios a recurso sin paginar en cliente). */
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(500_000)
    limit?: number = 100;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    offset?: number = 0;
}

