export interface Role {
    id: number;
    nombre: string;
    descripcion: string;
}

export interface Permission {
    id: number;
    nombre: string;
    descripcion: string;
}

export interface Menu {
    id: number;
    idPadre: number | null;
    nombre: string;
    url: string;
    icono: string;
    orden: number;
    nivel: number;
}

export interface TrabajadorEnUsuario {
    id: number;
    nombres?: string;
    apellidos?: string;
    nrodocumento?: string;
    correo?: string;
    empresa?: { id: number; razonsocial?: string; nombrecomercial?: string; nrodocumento?: string };
    responsable?: { id: number; nombres?: string; apellidos?: string } | null;
}

export class AuthUser {
    id: number;
    nombre: string;
    correo: string;
    contrasena: string;
    estado: number;
    fechacreacion: Date;
    fechamodificacion: Date;
    fotoPerfil?: string;
    trabajador?: TrabajadorEnUsuario;
    roles: Role[];
    permisos: Permission[];
    menus: Menu[];

    constructor(partial: Partial<AuthUser>) {
        Object.assign(this, partial);
    }
}
