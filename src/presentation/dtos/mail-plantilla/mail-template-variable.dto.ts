import { z } from 'zod';
import { defineZodDto } from '../../validation/zod-dto';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MailTemplateVariableDto {
  static readonly schema: z.ZodType<MailTemplateVariableDto> =
    defineZodDto<MailTemplateVariableDto>('MailTemplateVariableDto', {
      name: { schema: z.string().min(1) },
      label: { schema: z.string(), optional: true },
      required: { schema: z.boolean(), optional: true },
      example: { schema: z.string(), optional: true },
    });

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  label?: string;

  @ApiPropertyOptional()
  required?: boolean;

  @ApiPropertyOptional()
  example?: string;
}
