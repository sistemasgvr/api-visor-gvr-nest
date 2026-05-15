/**
 * Política de contraseña: mínimo 6 caracteres, al menos una mayúscula, un dígito y un símbolo.
 * El símbolo es cualquier caracter de esta lista sin letras ni dígitos (incluye / escapado).
 */
export const PASSWORD_POLICY_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\\[\]{};':"\\|,.\/`~\-]).{6,}$/;

export const PASSWORD_POLICY_MESSAGE =
  'La contraseña debe tener al menos 6 caracteres e incluir una mayúscula, un número y un símbolo';
