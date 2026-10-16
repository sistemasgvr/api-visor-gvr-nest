export class ListMailPlantillaQueryDto {
  busqueda?: string;

  soloActivas?: boolean = true;

  limit?: number = 50;

  offset?: number = 0;
}
