import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseFunctionService } from '../../../../infrastructure/database/database-function.service';

export interface ReferenciaRevision {
    id: number;
    idRevision: number;
    idProyectoAcc: string;
    dominioReferencia: string;
    tipoReferencia: string;
    idReferenciaExterna: string;
    versionReferencia: string | null;
    notasReferencia: string | null;
    urlDeepLink: string | null;
    metadataJson: Record<string, any> | null;
    fechaCreacion: string | Date;
    nombreCreador: string;
    nombreModificador: string;
}

@Injectable()
export class ObtenerReferenciasRevisionUseCase {
    constructor(
        private readonly dbFunctionService: DatabaseFunctionService,
    ) { }

    async execute(idRevision: number): Promise<ReferenciaRevision[]> {
        const rows = await this.dbFunctionService.callFunction<{
            id: number;
            id_revision: number;
            id_proyecto_acc: string;
            dominio_referencia: string;
            tipo_referencia: string;
            id_referencia_ext: string;
            version_referencia: string | null;
            notas_referencia: string | null;
            url_deep_link: string | null;
            metadata_json: Record<string, any> | null;
            fecha_creacion: string | Date;
            nombre_creador: string;
            nombre_modificador: string;
        }>('acc_ObtenerReferenciasRevision', [idRevision]);

        return (rows ?? []).map((r) => ({
            id: r.id,
            idRevision: r.id_revision,
            idProyectoAcc: r.id_proyecto_acc,
            dominioReferencia: r.dominio_referencia,
            tipoReferencia: r.tipo_referencia,
            idReferenciaExterna: r.id_referencia_ext,
            versionReferencia: r.version_referencia ?? null,
            notasReferencia: r.notas_referencia ?? null,
            urlDeepLink: r.url_deep_link ?? null,
            metadataJson: r.metadata_json ?? null,
            fechaCreacion: r.fecha_creacion,
            nombreCreador: r.nombre_creador,
            nombreModificador: r.nombre_modificador,
        }));
    }
}
