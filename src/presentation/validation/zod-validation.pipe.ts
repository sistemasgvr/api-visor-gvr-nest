import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import { z } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(_options?: unknown) {}
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const schema = (metadata.metatype as { schema?: z.ZodType } | undefined)
      ?.schema;
    if (!schema) {
      if (
        !metadata.data ||
        (metadata.type !== 'param' && metadata.type !== 'query') ||
        value == null
      )
        return value;
      if (metadata.metatype === Number) return Number(value);
      if (metadata.metatype === Boolean)
        return value === true || value === 'true';
      if (metadata.metatype === String) return String(value);
      return value;
    }
    const parsed = schema.safeParse(value ?? {});
    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue) => {
        const path = issue.path.join('.');
        return path ? `${path}: ${issue.message}` : issue.message;
      });
      throw new BadRequestException({
        message: messages,
        error: 'Bad Request',
        statusCode: 400,
      });
    }
    return parsed.data;
  }
}
// Configuración global de mensajes Zod. No modifica el formato HTTP del filtro común.
z.config(z.locales.es());
