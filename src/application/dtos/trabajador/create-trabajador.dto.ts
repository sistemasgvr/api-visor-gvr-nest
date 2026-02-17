import { Type } from 'class-transformer';
import { IsString, IsInt, IsEmail, IsOptional, MaxLength, IsNotEmpty, IsNumber, IsDateString, IsArray } from 'class-validator';

export class CreateTrabajadorDto {
    @IsNotEmpty() @IsString() @MaxLength(255) nombres: string;
    @IsNotEmpty() @IsString() @MaxLength(255) apellidos: string;
    @IsNotEmpty() @IsInt() idTipoDocumento: number;
    @IsNotEmpty() @IsString() @MaxLength(50) nroDocumento: string;
    @IsNotEmpty() @IsEmail() @MaxLength(255) correo: string;
    @IsNotEmpty() @IsInt() idEmpresa: number;

    @IsOptional() @IsInt() idResponsable?: number;
    @IsOptional() @IsInt() idRol?: number;
    @IsOptional() @IsDateString() fechaNacimiento?: string;
    @IsOptional() @IsString() @MaxLength(20) celular?: string;
    @IsOptional() @IsString() @MaxLength(20) telefonoEmergencia?: string;
    @IsOptional() @IsString() @MaxLength(255) contactoEmergenciaNombre?: string;
    @IsOptional() @IsInt() @Type(() => Number) idContactoEmergenciaParentesco?: number;
    @IsOptional() @IsString() direccionDomiciliaria?: string;
    @IsOptional() @IsInt() idPais?: number;
    @IsOptional() @IsInt() idDepartamento?: number;
    @IsOptional() @IsInt() idProvincia?: number;
    @IsOptional() @IsInt() idDistrito?: number;
    @IsOptional() @IsString() @MaxLength(11) nroRuc?: string;
    @IsOptional() @IsInt() idGradoInstruccion?: number;
    @IsOptional() @IsInt() idCarrera?: number;
    @IsOptional() @IsInt() idEntidadBancaria?: number;
    @IsOptional() @IsString() @MaxLength(50) nroCuentaCorriente?: string;
    @IsOptional() @IsString() @MaxLength(50) nroCci?: string;
    @IsOptional() @IsNumber() remuneracion?: number;
    @IsOptional() @IsInt() idTipoContrato?: number;
    @IsOptional() @IsInt() idDuracionContrato?: number;
    @IsOptional() @IsDateString() fechaInicioLabores?: string;
    @IsOptional() @IsArray() adjuntos?: { idTipoAdjunto: number; ruta: string }[];
}
