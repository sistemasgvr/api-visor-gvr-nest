import { Injectable } from '@nestjs/common';
import type { IUbicacionRepository } from '../../domain/repositories/ubicacion.repository.interface';
import { DatabaseFunctionService } from '../database/database-function.service';

@Injectable()
export class UbicacionRepository implements IUbicacionRepository {
  constructor(private readonly database: DatabaseFunctionService) {}
  listarPaises() {
    return this.database.callFunction('gen_ListarPaises', []);
  }
  listarDepartamentos(idPais?: number) {
    return this.database.callFunction('gen_ListarDepartamentos', [
      idPais ?? null,
    ]);
  }
  listarProvincias(idDepartamento?: number) {
    return this.database.callFunction('gen_ListarProvincias', [
      idDepartamento ?? null,
    ]);
  }
  listarDistritos(idProvincia?: number) {
    return this.database.callFunction('gen_ListarDistritos', [
      idProvincia ?? null,
    ]);
  }
}
