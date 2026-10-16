import { ValidationError } from 'class-validator';
import { spanishValidationExceptionFactory } from './spanish-validation-messages';

describe('spanishValidationExceptionFactory', () => {
  it('devuelve 400 con mensaje en español para isEmail en correo', () => {
    const err = new ValidationError();
    err.property = 'correo';
    err.constraints = { isEmail: 'correo must be an email' };

    const ex = spanishValidationExceptionFactory([err]);
    const body = ex.getResponse() as { message: string };
    expect(ex.getStatus()).toBe(400);
    expect(body.message).toMatch(/correo/i);
    expect(body.message).toMatch(/correo electrónico|válido/i);
  });

  it('une varios mensajes con espacio', () => {
    const e1 = new ValidationError();
    e1.property = 'nombres';
    e1.constraints = { isNotEmpty: 'nombres should not be empty' };
    const e2 = new ValidationError();
    e2.property = 'apellidos';
    e2.constraints = { isNotEmpty: 'apellidos should not be empty' };

    const ex = spanishValidationExceptionFactory([e1, e2]);
    const body = ex.getResponse() as { message: string };
    expect(body.message).toContain(' ');
  });
});
