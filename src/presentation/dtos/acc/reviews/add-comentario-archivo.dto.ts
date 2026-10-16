import { IsNotEmpty, IsString } from 'class-validator';

export class AddComentarioArchivoDto {
  @IsNotEmpty()
  @IsString()
  contenido!: string;
}
