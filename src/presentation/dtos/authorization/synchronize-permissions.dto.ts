import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import type { AuthorizationScope } from '../../../application/ports/authorization.port';

export class RolePermissionGrantDto {
  @IsInt()
  @Min(1)
  @Max(2147483647)
  idpermiso!: number;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsIn(['global', 'propios', 'asignados', 'todos'], { each: true })
  alcances!: AuthorizationScope[];
}

export class SynchronizeRolePermissionsDto {
  @IsInt()
  @Min(0)
  @Max(2147483647)
  revision!: number;

  @IsArray()
  @ArrayMaxSize(10000)
  @ArrayUnique((grant: RolePermissionGrantDto) => grant?.idpermiso)
  @ValidateNested({ each: true })
  @Type(() => RolePermissionGrantDto)
  permisos!: RolePermissionGrantDto[];
}

export class SynchronizeMenuPermissionsDto {
  @IsInt()
  @Min(0)
  @Max(2147483647)
  revision!: number;

  @IsArray()
  @ArrayMaxSize(10000)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(2147483647, { each: true })
  permisos!: number[];
}
