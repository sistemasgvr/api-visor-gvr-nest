import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  Matches,
} from 'class-validator';
import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '../../../shared/validation/password-policy';

export class UpdateCredentialsDto {
  @IsOptional()
  @IsEmail()
  nuevoCorreo?: string;

  @IsOptional()
  @ValidateIf(
    (o) =>
      o.nuevaContrasena !== undefined &&
      o.nuevaContrasena !== null &&
      o.nuevaContrasena !== '',
  )
  @IsString()
  @MinLength(6, { message: PASSWORD_POLICY_MESSAGE })
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  nuevaContrasena?: string;
}
