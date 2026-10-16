import { IsArray, IsInt } from 'class-validator';

export class SincronizarRolesNovedadDto {
  @IsArray()
  @IsInt({ each: true, message: 'Cada rol debe ser un número entero' })
  roles: number[];
}
