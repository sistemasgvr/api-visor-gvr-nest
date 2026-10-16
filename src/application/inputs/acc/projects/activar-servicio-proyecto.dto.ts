export class ActivarServicioProyectoDto {
  email: string;

  service: string;

  accessLevel?: string = 'administrator';

  region?: string;
}
