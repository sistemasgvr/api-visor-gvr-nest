import { Transform } from 'class-transformer';

/**
 * Los inputs type="date" y algunos formularios envían "" cuando no hay valor.
 * @IsOptional() no omite validadores para string vacío; convertir a undefined.
 */
export function EmptyStringToUndefined(): ReturnType<typeof Transform> {
    return Transform(({ value }) => (value === '' ? undefined : value));
}
