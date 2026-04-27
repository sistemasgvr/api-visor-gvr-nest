import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export class AgregarEvidenciasActividadDto {
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  urls: string[] = [];
}
