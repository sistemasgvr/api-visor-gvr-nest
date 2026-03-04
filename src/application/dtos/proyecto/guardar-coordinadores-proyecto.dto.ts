import { IsArray, IsInt, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CoordinadorItemDto {
    @IsNotEmpty()
    @IsInt()
    idtrabajador: number;

    @IsArray()
    @IsInt({ each: true })
    miembrosEquipo: number[] = [];
}

export class GuardarCoordinadoresProyectoDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CoordinadorItemDto)
    coordinadores: CoordinadorItemDto[];
}
