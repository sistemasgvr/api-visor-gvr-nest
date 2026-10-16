import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

/**
 * Nombres de propiedad habituales en DTOs → etiqueta en español para el usuario.
 * (La última clave de rutas anidadas, ej. "correo" de "direccion.correo".)
 */
const FIELD_LABEL: Record<string, string> = {
  // Auth / usuario
  correo: 'El correo electrónico',
  email: 'El correo electrónico',
  password: 'La contraseña',
  currentPassword: 'La contraseña actual',
  newPassword: 'La nueva contraseña',
  contrasenaActual: 'La contraseña actual',
  nuevaContrasena: 'La nueva contraseña',
  nombres: 'Los nombres',
  apellidos: 'Los apellidos',
  nroDocumento: 'El número de documento',
  nrodocumento: 'El número de documento',
  idTipoDocumento: 'El tipo de documento',
  idtipodocumento: 'El tipo de documento',
  idEmpresa: 'La empresa',
  idempresa: 'La empresa',
  idResponsable: 'El responsable',
  idresponsable: 'El responsable',
  idRol: 'El rol',
  idrol: 'El rol',
  idUsuario: 'El usuario',
  celular: 'El celular',
  telefonoEmergencia: 'El teléfono de emergencia',
  contactoEmergenciaNombre: 'El nombre de contacto de emergencia',
  idContactoEmergenciaParentesco: 'El parentesco del contacto de emergencia',
  direccionDomiciliaria: 'La dirección',
  idPais: 'El país',
  idpais: 'El país',
  idDepartamento: 'El departamento',
  iddepartamento: 'El departamento',
  idProvincia: 'La provincia',
  idprovincia: 'La provincia',
  idDistrito: 'El distrito',
  iddistrito: 'El distrito',
  nroRuc: 'El RUC',
  nroruc: 'El RUC',
  idGradoInstruccion: 'El grado de instrucción',
  idCarrera: 'La carrera',
  idEntidadBancaria: 'La entidad bancaria',
  nroCuentaCorriente: 'El número de cuenta',
  nroCci: 'El número de CCI',
  remuneracion: 'La remuneración',
  idTipoContrato: 'El tipo de contrato',
  idDuracionContrato: 'La duración del contrato',
  idModalidad: 'La modalidad',
  idPuestoTrabajo: 'El puesto de trabajo',
  idmodalidad: 'La modalidad',
  fechaNacimiento: 'La fecha de nacimiento',
  fechanacimiento: 'La fecha de nacimiento',
  fechaInicioLabores: 'La fecha de inicio de labores',
  fechaInicioContrato: 'La fecha de inicio de contrato',
  fechaFinContrato: 'La fecha de fin de contrato',
  razonSocial: 'La razón social',
  nombre: 'El nombre',
  descripcion: 'La descripción',
  titulo: 'El título',
  idProyecto: 'El proyecto',
  idCuenta: 'La cuenta',
  accountId: 'El identificador de cuenta',
  projectId: 'El identificador de proyecto',
  folderId: 'El identificador de carpeta',
  itemId: 'El identificador del ítem',
  file: 'El archivo',
  fileName: 'El nombre del archivo',
  roles: 'Los roles',
  roleIds: 'Los roles',
  permisos: 'Los permisos',
  idMenu: 'El menú',
  idPermiso: 'El permiso',
  codigo: 'El código',
  estado: 'El estado',
};

const SENTENCE_PATTERNS: { test: RegExp; es: string }[] = [
  {
    test: /must be (?:a |an )?e-?mail/i,
    es: 'debe ser un correo electrónico válido',
  },
  { test: /must be a string/i, es: 'debe ser texto' },
  {
    test: /each value in .+ must be a string/i,
    es: 'cada valor debe ser texto',
  },
  {
    test: /each value in .+ must be a number/i,
    es: 'cada valor debe ser un número',
  },
  { test: /must be a number(?! string)/i, es: 'debe ser un número' },
  { test: /must be an integer/i, es: 'debe ser un número entero' },
  { test: /must be a boolean/i, es: 'debe ser verdadero o falso' },
  { test: /must be a (?:date|Date)/i, es: 'debe ser una fecha válida' },
  {
    test: /must be a date string/i,
    es: 'debe ser una fecha en formato ISO válida',
  },
  { test: /must be a UUID/i, es: 'debe ser un UUID válido' },
  { test: /must be an array/i, es: 'debe ser un listado' },
  { test: /must be an? object/i, es: 'debe ser un objeto' },
  {
    test: /must be shorter than or equal to (\d+) characters/i,
    es: 'no puede superar $1 caracteres',
  },
  {
    test: /must be longer than or equal to (\d+) characters/i,
    es: 'debe tener al menos $1 caracteres',
  },
  {
    test: /must (?:be |contain )?longer? than or equal to (\d+) and (?:shorter|shorter) than or equal to (\d+) characters/i,
    es: 'debe tener entre $1 y $2 caracteres',
  },
  {
    test: /must be equal to (\d+) characters/i,
    es: 'debe tener exactamente $1 caracteres',
  },
  { test: /should not be empty/i, es: 'es obligatorio' },
  {
    test: /should not (?:be |be null|be undefined|null|empty)/i,
    es: 'es obligatorio',
  },
  {
    test: /(property )?.+ (should not exist|should not be provided)/i,
    es: 'incluye datos no permitidos',
  },
  {
    test: /must (?:be |a )?positive (?:a )?number/i,
    es: 'debe ser un número mayor que cero',
  },
  {
    test: /must (?:be |a )?non-?negative (?:a )?number/i,
    es: 'debe ser un número mayor o igual a cero',
  },
  {
    test: /must not (?:be |)greater than (\d+)/i,
    es: 'no puede ser mayor que $1',
  },
  {
    test: /must not (?:be |)less than (\d+)/i,
    es: 'no puede ser menor que $1',
  },
  {
    test: /must be one of the following values: (.+)/i,
    es: 'debe ser uno de los valores permitidos',
  },
  {
    test: /must be a valid ISO 8601 date string/i,
    es: 'debe ser una fecha ISO 8601 válida',
  },
  { test: /is not a valid (?:military )?time/i, es: 'no es una hora válida' },
  { test: /must be a (?:url|URL)\b/i, es: 'debe ser una URL válida' },
  {
    test: /must be a (?:military|valid) time string/i,
    es: 'debe ser una hora válida',
  },
  { test: /must (?:be |)match\?? /i, es: 'no cumple el formato requerido' },
  {
    test: /must (?:be |)a?(?:n)? mimetype/i,
    es: 'el tipo de archivo no es válido',
  },
  {
    test: /must (?:be |)a?(?:n)?? enum/i,
    es: 'el valor no es una opción válida',
  },
];

/**
 * Último segmento de "a.b.c" o la propia propiedad.
 */
function lastKey(property: string): string {
  const p = property.includes('.') ? property.split('.').pop()! : property;
  return p;
}

function labelFor(property: string): string {
  const key = lastKey(property);
  if (FIELD_LABEL[key]) {
    return FIELD_LABEL[key];
  }
  return `El campo «${key}»`;
}

/**
 * Convierte el resto del mensaje en inglés (sin el nombre de la propiedad al inicio) a español.
 */
function translateMessageTail(tail: string): string {
  const s = tail.trim();
  for (const { test, es } of SENTENCE_PATTERNS) {
    if (test.test(s)) {
      return s.replace(test, es);
    }
  }
  return s;
}

/**
 * A partir de (constraintKey, defaultMessage) genera un mensaje en español.
 */
function buildMessage(
  property: string,
  constraintKey: string,
  defaultMessage: string,
): string {
  const label = labelFor(property);

  switch (constraintKey) {
    case 'isEmail':
      return `${label} debe ser un correo electrónico válido`;
    case 'isNotEmpty':
    case 'isDefined':
      return `${label} es obligatorio`;
    case 'isString':
      return `${label} debe ser texto`;
    case 'isInt':
    case 'isNumber':
    case 'isPositive':
    case 'isNegative':
      return `${label} debe ser un número válido`;
    case 'isBoolean':
      return `${label} debe ser verdadero o falso`;
    case 'isArray':
      return `${label} debe ser un listado`;
    case 'isDateString':
    case 'isDate':
      return `${label} debe ser una fecha válida`;
    case 'isUUID':
    case 'isUUid':
      return `${label} debe ser un identificador UUID válido`;
    case 'isUrl':
      return `${label} debe ser una URL válida`;
    case 'isIn':
    case 'isNotIn':
      return `${label} tiene un valor no permitido`;
    case 'isEnum':
      return `${label} no es un valor de la enumeración permitida`;
    case 'isObject':
      return `${label} debe ser un objeto`;
    case 'isNotEmptyObject':
      return `${label} no puede ser un objeto vacío`;
    case 'minLength':
      return `${label} no cumple la longitud mínima requerida`;
    case 'maxLength':
      return `${label} excede la longitud permitida`;
    case 'min':
    case 'max': {
      const t = defaultMessage
        .replace(
          new RegExp(
            `^${lastKey(property).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`,
            'i',
          ),
          '',
        )
        .trim();
      return `${label} ${translateMessageTail(t)}.`;
    }
    case 'length':
      return `${label} no cumple la longitud requerida`;
    case 'matches':
    case 'isMilitaryTime':
    case 'isTimeZone':
      return `${label} no tiene el formato requerido`;
    case 'isOptional':
      return defaultMessage; // poco frecuente
    case 'isInstance':
    case 'validateNested':
    case 'validateBy':
    case 'validateIf':
    case 'arrayNotEmpty':
    case 'isMimeType': {
      const m = defaultMessage?.replace(
        new RegExp(
          `^${lastKey(property).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`,
        ),
        '',
      );
      const t = m ? translateMessageTail(m) : 'no es válido';
      return t.length < 12 || t.startsWith('incluye')
        ? t.charAt(0).toUpperCase() + t.slice(1)
        : `${label} ${t.charAt(0).toLowerCase() + t.slice(1)}`;
    }
    case 'whitelistValidation':
    case 'allow':
      return 'Se enviaron propiedades no permitidas. Revise el cuerpo de la petición e intente de nuevo.';
    default: {
      const m =
        defaultMessage?.replace(
          new RegExp(
            `^${lastKey(property).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`,
            'i',
          ),
          '',
        ) ?? '';
      if (!m.trim()) {
        return `${label} no es válido`;
      }
      const t = translateMessageTail(m);
      if (SENTENCE_PATTERNS.some((p) => p.test.test(m))) {
        if (t.startsWith('incluye') || t.length < 30) {
          return `${t.charAt(0).toUpperCase() + t.slice(1)}.`;
        }
        return `${label} ${t.charAt(0).toLowerCase() + t.slice(1)}.`;
      }
      return `${label} no supera la validación.`;
    }
  }
}

function walkErrors(err: ValidationError, messages: string[]): void {
  if (err.constraints && Object.keys(err.constraints).length > 0) {
    for (const [key, defaultMessage] of Object.entries(err.constraints)) {
      messages.push(buildMessage(err.property, key, String(defaultMessage)));
    }
  }
  for (const child of err.children ?? []) {
    walkErrors(child, messages);
  }
}

/**
 * Todos los mensajes de class-validator, en un solo string para toasts/respuesta uniforme.
 */
function flattenValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];
  for (const e of errors) {
    walkErrors(e, messages);
  }
  return messages;
}

/**
 * Factory para `ValidationPipe` — respuestas de validación 400 en español.
 */
export function spanishValidationExceptionFactory(
  errors: ValidationError[],
): BadRequestException {
  const list = flattenValidationErrors(errors);
  const message = list.length === 1 ? list[0] : list.join(' ');

  return new BadRequestException({
    message,
    status: 400,
  });
}
