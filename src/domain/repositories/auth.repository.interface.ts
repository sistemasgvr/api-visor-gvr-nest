import { AuthUser } from '../entities/auth-user.entity';

export interface RegisterUserData {
    nombre: string;
    correo: string;
    contrasena: string;
    estado?: number;
    id?: number | null;
}

export interface IAuthRepository {
    register(data: RegisterUserData): Promise<AuthUser>;
    login(correo: string): Promise<AuthUser | null>;
    obtenerPerfilUsuario(idUsuario: number): Promise<any>;
    actualizarCredenciales(
        idUsuario: number,
        nuevoCorreo: string | null,
        nuevaContrasena: string | null,
        idUsuarioModificacion: number
    ): Promise<any>;
    actualizarFotoPerfil(idUsuario: number, fotoPerfil: string): Promise<{ fotoPerfil: string }>;

    /**
     * Actualiza el estado de conexión del usuario (vía WebSocket).
     */
    setUsuarioConectado(idUsuario: number, conectado: boolean): Promise<void>;

    /**
     * Obtiene total de usuarios activos y cuántos están conectados (isconnected).
     */
    getEstadisticasUsuarios(): Promise<{ total: number; conectados: number }>;
}

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';
