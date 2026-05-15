import { IsString, MinLength, Matches } from 'class-validator';
import {
  PASSWORD_POLICY_MESSAGE,
  PASSWORD_POLICY_REGEX,
} from '../../../shared/validation/password-policy';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, {
    message: 'La contraseña actual debe tener al menos 6 caracteres',
  })
  contrasenaActual: string;

  @IsString()
  @Matches(PASSWORD_POLICY_REGEX, {
    message: PASSWORD_POLICY_MESSAGE,
  })
  nuevaContrasena: string;
}
