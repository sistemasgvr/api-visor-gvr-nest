import { Module } from '@nestjs/common';
import { AsignarRolMenuUseCase } from '../../application/use-cases/menu-gestion/asignar-rol-menu.use-case';
import { AsignarRolesMenuUseCase } from '../../application/use-cases/menu-gestion/asignar-roles-menu.use-case';
import { ClonarMenuUseCase } from '../../application/use-cases/menu-gestion/clonar-menu.use-case';
import { CrearMenuUseCase } from '../../application/use-cases/menu-gestion/crear-menu.use-case';
import { EditarMenuUseCase } from '../../application/use-cases/menu-gestion/editar-menu.use-case';
import { EliminarMenuUseCase } from '../../application/use-cases/menu-gestion/eliminar-menu.use-case';
import { ListarMenuPadresDisponiblesUseCase } from '../../application/use-cases/menu-gestion/listar-menu-padres-disponibles.use-case';
import { ListarMenusTreeUseCase } from '../../application/use-cases/menu-gestion/listar-menus-tree.use-case';
import { ListarMenusUseCase } from '../../application/use-cases/menu-gestion/listar-menus.use-case';
import { ListarRolesDisponiblesMenuUseCase } from '../../application/use-cases/menu-gestion/listar-roles-disponibles-menu.use-case';
import { ListarRolesMenuUseCase } from '../../application/use-cases/menu-gestion/listar-roles-menu.use-case';
import { MoverMenuUseCase } from '../../application/use-cases/menu-gestion/mover-menu.use-case';
import { ObtenerDetalleMenuUseCase } from '../../application/use-cases/menu-gestion/obtener-detalle-menu.use-case';
import { ObtenerMenuUseCase } from '../../application/use-cases/menu-gestion/obtener-menu.use-case';
import { RemoverRolMenuUseCase } from '../../application/use-cases/menu-gestion/remover-rol-menu.use-case';
import { ReordenarMenuUseCase } from '../../application/use-cases/menu-gestion/reordenar-menu.use-case';
import { SincronizarRolesMenuUseCase } from '../../application/use-cases/menu-gestion/sincronizar-roles-menu.use-case';
import { MENU_GESTION_REPOSITORY } from '../../domain/repositories/menu-gestion.repository.interface';
import { MenuGestionRepository } from '../../infrastructure/repositories/menu-gestion.repository';
import { MenuGestionController } from '../../presentation/controllers/menu-gestion.controller';
import { applicationProvider } from '../application.providers';
import { BroadcastModule } from './broadcast.module';
import { AuthenticationModule } from './platform/authentication.module';
import { DatabaseModule } from './platform/database.module';

@Module({
  imports: [DatabaseModule, BroadcastModule, AuthenticationModule],
  controllers: [MenuGestionController],
  providers: [
    {
      provide: MENU_GESTION_REPOSITORY,
      useClass: MenuGestionRepository,
    },
    applicationProvider(ListarMenusUseCase),
    applicationProvider(ListarMenusTreeUseCase),
    applicationProvider(ObtenerMenuUseCase),
    applicationProvider(CrearMenuUseCase),
    applicationProvider(EditarMenuUseCase),
    applicationProvider(EliminarMenuUseCase),
    applicationProvider(ListarRolesMenuUseCase),
    applicationProvider(ListarRolesDisponiblesMenuUseCase),
    applicationProvider(AsignarRolMenuUseCase),
    applicationProvider(AsignarRolesMenuUseCase),
    applicationProvider(RemoverRolMenuUseCase),
    applicationProvider(SincronizarRolesMenuUseCase),
    applicationProvider(ObtenerDetalleMenuUseCase),
    applicationProvider(ListarMenuPadresDisponiblesUseCase),
    applicationProvider(ClonarMenuUseCase),
    applicationProvider(MoverMenuUseCase),
    applicationProvider(ReordenarMenuUseCase),
  ],
  exports: [MENU_GESTION_REPOSITORY],
})
export class MenuGestionModule {}
