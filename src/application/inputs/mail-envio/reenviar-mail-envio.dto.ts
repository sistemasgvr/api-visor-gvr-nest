export class ReenviarMailEnvioDto {
  templateId!: string;

  idTrabajador!: number;
}

export class ReenviarPendientesMailEnvioDto {
  templateId!: string;

  idTrabajadores?: number[];
}
