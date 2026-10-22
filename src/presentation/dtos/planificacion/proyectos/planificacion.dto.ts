import { Type, Transform } from 'class-transformer';
import {
  IsInt,
  Min,
  Max,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsNumber,
  IsArray,
  ArrayMaxSize,
  ArrayUnique,
  ValidateNested,
  ValidateIf,
  IsIn,
  Matches,
  IsDateString,
  IsDefined,
  IsObject,
  registerDecorator,
  type ValidationArguments,
} from 'class-validator';
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
function ActividadCompatible() {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: 'actividadCompatible',
      target: target.constructor,
      propertyName,
      options: {
        message: 'Un hito requiere cero minutos y no admite asignaciones',
      },
      validator: {
        validate(value: unknown) {
          if (!value || typeof value !== 'object' || Array.isArray(value))
            return false;
          const data = value as {
            eshito?: boolean;
            minutosestimados?: number;
            asignaciones?: unknown[];
          };
          return (
            data.eshito !== true ||
            ((data.minutosestimados === undefined ||
              data.minutosestimados === 0) &&
              (!data.asignaciones || data.asignaciones.length === 0))
          );
        },
      },
    });
}
function FechaPosterior(inicio: string) {
  return (target: object, propertyName: string) =>
    registerDecorator({
      name: 'fechaPosterior',
      target: target.constructor,
      propertyName,
      constraints: [inicio],
      options: {
        message: 'La fecha final debe ser mayor o igual a la inicial',
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const start = (args.object as Record<string, unknown>)[inicio];
          return (
            value == null ||
            start == null ||
            (typeof value === 'string' &&
              typeof start === 'string' &&
              value >= start)
          );
        },
      },
    });
}
export class ProyectoPlanParamsDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  id!: number;
}
export class PlanParamsDto extends ProyectoPlanParamsDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idPlan!: number;
}
export class ActividadPlanParamsDto extends PlanParamsDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idActividad!: number;
}
export class AmpliacionPlanParamsDto extends PlanParamsDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idAmpliacion!: number;
}
export class AsignacionParamsDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idAsignacion!: number;
}
export class CrearPlanDto {
  @ValidateIf((_o, v) => v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idaprobador?: number;
}
export class RevisionPlanDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  revisionPlan!: number;

  @ValidateIf((_o, v) => v !== undefined)
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  motivo?: string;
}
export class RevisionActividadDto extends RevisionPlanDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  revision!: number;
}
export class MotivoPlanDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  revisionPlan!: number;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  motivo!: string;
}
export class ReglasDto {
  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idaprobador?: number | null;

  @ValidateIf((_o, v) => v !== undefined)
  @IsBoolean()
  bloquearexceso?: boolean;

  @ValidateIf((_o, v) => v !== undefined)
  @IsBoolean()
  permitirnoplaneadas?: boolean;

  @ValidateIf((_o, v) => v !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  toleranciaporcentaje?: number;

  @ValidateIf((_o, v) => v !== undefined)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  alertaporcentaje?: number;
}
export class ReglasPlanDto extends RevisionPlanDto {
  @IsDefined()
  @IsObject()
  @ValidateNested({ each: false })
  @Type(() => ReglasDto)
  reglas!: ReglasDto;
}
export class PersonaPlanDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idtrabajador!: number;

  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  minutosasignados!: number;
}
export class DependenciaPlanDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idpredecesora!: number;

  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(0)
  desfasedias!: number;
}
export class CrearDatosActividadDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  identregable!: number;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(240)
  nombre!: string;

  @ValidateIf((_o, v) => v !== undefined)
  @IsString()
  @MaxLength(4000)
  descripcion?: string;

  @ValidateIf((_o, v) => v !== undefined)
  @IsBoolean()
  eshito?: boolean;

  @ValidateIf((_o, v) => v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(0)
  minutosestimados?: number;

  @ValidateIf((_o, v) => v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(0)
  orden?: number;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  fechanoiniciarantes?: string | null;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  @FechaPosterior('fechanoiniciarantes')
  fechanofinalizarantes?: string | null;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  fechalimite?: string | null;

  @ValidateIf((_o, v) => v !== undefined)
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique((v: PersonaPlanDto) => v.idtrabajador)
  @ValidateNested({ each: true })
  @Type(() => PersonaPlanDto)
  asignaciones?: PersonaPlanDto[];
}
export class EditarDatosActividadDto {
  @ValidateIf((_o, v) => v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  identregable?: number;

  @ValidateIf((_o, v) => v !== undefined)
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(240)
  nombre?: string;

  @ValidateIf((_o, v) => v !== undefined)
  @IsString()
  @MaxLength(4000)
  descripcion?: string;

  @ValidateIf((_o, v) => v !== undefined)
  @IsBoolean()
  eshito?: boolean;

  @ValidateIf((_o, v) => v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(0)
  minutosestimados?: number;

  @ValidateIf((_o, v) => v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(0)
  orden?: number;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  fechanoiniciarantes?: string | null;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  @FechaPosterior('fechanoiniciarantes')
  fechanofinalizarantes?: string | null;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  fechalimite?: string | null;

  @ValidateIf((_o, v) => v !== undefined)
  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique((v: PersonaPlanDto) => v.idtrabajador)
  @ValidateNested({ each: true })
  @Type(() => PersonaPlanDto)
  asignaciones?: PersonaPlanDto[];
}
export class CrearActividadPlanDto extends RevisionPlanDto {
  @IsDefined()
  @IsObject()
  @ValidateNested({ each: false })
  @ActividadCompatible()
  @Type(() => CrearDatosActividadDto)
  datos!: CrearDatosActividadDto;
}
export class EditarActividadPlanDto extends RevisionActividadDto {
  @IsDefined()
  @IsObject()
  @ValidateNested({ each: false })
  @ActividadCompatible()
  @Type(() => EditarDatosActividadDto)
  datos!: EditarDatosActividadDto;
}
export class AsignacionesPlanDto extends RevisionPlanDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  revisionActividad!: number;

  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique((v: PersonaPlanDto) => v.idtrabajador)
  @ValidateNested({ each: true })
  @Type(() => PersonaPlanDto)
  asignaciones!: PersonaPlanDto[];
}
export class DependenciasPlanDto extends RevisionPlanDto {
  @IsArray()
  @ArrayMaxSize(200)
  @ArrayUnique((v: DependenciaPlanDto) => v.idpredecesora)
  @ValidateNested({ each: true })
  @Type(() => DependenciaPlanDto)
  dependencias!: DependenciaPlanDto[];
}
export class OrdenPlanDto extends RevisionPlanDto {
  @IsArray()
  @ArrayMaxSize(2000)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  entregables!: number[];

  @IsArray()
  @ArrayMaxSize(2000)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  actividades!: number[];
}
export class CambioActividadDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idactividad!: number;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  fechanoiniciarantes?: string | null;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  @FechaPosterior('fechanoiniciarantes')
  fechanofinalizarantes?: string | null;

  @ValidateIf((_o, v) => v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(0)
  orden?: number;
}
export class CambioAsignacionDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idactividad!: number;

  @IsArray()
  @ArrayMaxSize(100)
  @ArrayUnique((v: PersonaPlanDto) => v.idtrabajador)
  @ValidateNested({ each: true })
  @Type(() => PersonaPlanDto)
  personas!: PersonaPlanDto[];
}
export class CambioDependenciaDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idsucesora!: number;

  @IsArray()
  @ArrayMaxSize(200)
  @ArrayUnique((v: DependenciaPlanDto) => v.idpredecesora)
  @ValidateNested({ each: true })
  @Type(() => DependenciaPlanDto)
  predecesoras!: DependenciaPlanDto[];
}
export class CambioEntregableDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  identregable!: number;

  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(0)
  orden!: number;
}
export class CambiosDto {
  @ValidateIf((_o, v) => v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idactividad?: number;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  fechanoiniciarantes?: string | null;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  @FechaPosterior('fechanoiniciarantes')
  fechanofinalizarantes?: string | null;

  @ValidateIf((_o, v) => v !== undefined)
  @IsArray()
  @ArrayMaxSize(200)
  @ArrayUnique((v: CambioActividadDto) => v.idactividad)
  @ValidateNested({ each: true })
  @Type(() => CambioActividadDto)
  actividades?: CambioActividadDto[];

  @ValidateIf((_o, v) => v !== undefined)
  @IsArray()
  @ArrayMaxSize(200)
  @ArrayUnique((v: CambioAsignacionDto) => v.idactividad)
  @ValidateNested({ each: true })
  @Type(() => CambioAsignacionDto)
  asignaciones?: CambioAsignacionDto[];

  @ValidateIf((_o, v) => v !== undefined)
  @IsArray()
  @ArrayMaxSize(200)
  @ArrayUnique((v: CambioDependenciaDto) => v.idsucesora)
  @ValidateNested({ each: true })
  @Type(() => CambioDependenciaDto)
  dependencias?: CambioDependenciaDto[];

  @ValidateIf((_o, v) => v !== undefined)
  @IsArray()
  @ArrayMaxSize(200)
  @ArrayUnique((v: CambioEntregableDto) => v.identregable)
  @ValidateNested({ each: true })
  @Type(() => CambioEntregableDto)
  entregables?: CambioEntregableDto[];
}
export class PrevisualizarPlanDto {
  @IsDefined()
  @IsObject()
  @ValidateNested({ each: false })
  @Type(() => CambiosDto)
  cambios!: CambiosDto;
}
export class LineaBaseDto extends MotivoPlanDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  nombre!: string;
}
export class ReprogramarPlanDto extends MotivoPlanDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  revision!: number;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  fechaNoIniciarAntes?: string | null;

  @ValidateIf((_o, v) => v !== undefined && v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  @FechaPosterior('fechaNoIniciarAntes')
  fechaNoFinalizarAntes?: string | null;
}
export class EstadoActividadPlanDto extends MotivoPlanDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  revision!: number;

  @IsInt()
  @Max(2147483647)
  @IsIn([703, 704, 705, 706])
  idEstadoDestino!: number;
}
export class EstadoPlanDto extends MotivoPlanDto {
  @IsInt()
  @Max(2147483647)
  @IsIn([701, 702])
  idEstadoDestino!: number;
}
export class PaginacionPlanDto {
  @ValidateIf((_o, v) => v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(0)
  offset?: number;

  @ValidateIf((_o, v) => v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  @Max(200)
  limite?: number;
}
export class HistorialPlanDto extends PaginacionPlanDto {
  @IsIn(['cambios', 'movimientos', 'lineasbase', 'detallelineabase'])
  tipo!: 'cambios' | 'movimientos' | 'lineasbase' | 'detallelineabase';

  @ValidateIf(
    (o: HistorialPlanDto, v) =>
      o.tipo === 'detallelineabase' || v !== undefined,
  )
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idLineaBase?: number;
}
export class ResolverAmpliacionDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(0)
  minutosAprobados!: number;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  resolucion!: string;
}
export class MisAsignacionesDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  fecha!: string;

  @ValidateIf((_o, v) => v !== undefined)
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idProyecto?: number;
}
export class EstadoParteDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  revision!: number;

  @IsInt()
  @Max(2147483647)
  @IsIn([703, 704, 705, 706])
  idEstadoDestino!: number;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  motivo!: string;
}
export class SolicitarAmpliacionDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  @Max(60000)
  minutos!: number;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  motivo!: string;
}
export class MisAmpliacionesDto extends PaginacionPlanDto {
  @Type(() => Number)
  @IsInt()
  @Max(2147483647)
  @Min(1)
  idPlan!: number;
}
