export class ListarRecursosDto {
  busqueda?: string = '';

  resource_type?: string = '';

  limit?: number = 10;

  offset?: number = 0;
}
