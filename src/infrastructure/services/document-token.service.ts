import { Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';

interface DocumentToken {
    token: string;
    userId: number;
    projectId: string;
    itemId: string;
    fileName: string;
    accessToken?: string; // Token de Autodesk para descargar el archivo
    createdAt: Date;
    expiresAt: Date;
    used: boolean;
}

/** Sesión de usuario para un documento (mismo documento = mismo docId = edición colaborativa) */
export interface UserSessionTokenData {
    userId: number;
    projectId: string;
    itemId: string;
    fileName: string;
    accessToken?: string;
    expiresAt: Date;
}

@Injectable()
export class DocumentTokenService {
    // Almacenamiento en memoria de tokens (en producción considerar Redis)
    private tokens: Map<string, DocumentToken> = new Map();

    // Tiempo de expiración en minutos
    private readonly TOKEN_EXPIRATION_MINUTES = 10;

    // Limpiar tokens expirados cada 5 minutos
    constructor() {
        setInterval(() => this.cleanExpiredTokens(), 5 * 60 * 1000);
    }

    /**
     * Genera un token temporal para acceder a un documento
     */
    generateToken(
        userId: number,
        projectId: string,
        itemId: string,
        fileName: string,
        expiresInMinutes: number = this.TOKEN_EXPIRATION_MINUTES,
        accessToken?: string,
    ): string {
        const token = randomUUID();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000);

        this.tokens.set(token, {
            token,
            userId,
            projectId,
            itemId,
            fileName,
            accessToken,
            createdAt: now,
            expiresAt,
            used: false,
        });

        return token;
    }

    /**
     * Valida y consume un token (puede usarse múltiples veces hasta que expire,
     * ya que Microsoft Office puede hacer múltiples requests)
     */
    validateToken(token: string): DocumentToken | null {
        const documentToken = this.tokens.get(token);

        if (!documentToken) {
            return null;
        }

        // Verificar si expiró
        if (new Date() > documentToken.expiresAt) {
            this.tokens.delete(token);
            return null;
        }

        return documentToken;
    }

    /**
     * Invalida un token manualmente
     */
    invalidateToken(token: string): void {
        this.tokens.delete(token);
    }

    /**
     * Genera un ID estable por documento para que todos los usuarios que abren
     * el mismo (projectId, itemId) reciban el mismo WOPISrc y Collabora agrupe la sesión (coautoría).
     */
    generateStableDocId(projectId: string, itemId: string): string {
        const payload = `${projectId}|${itemId}`;
        return createHash('sha256').update(payload).digest('base64url').substring(0, 32);
    }

    /** Almacén de sesiones de usuario por access_token (para WOPI con mismo docId) */
    private userSessions: Map<string, UserSessionTokenData & { token: string }> = new Map();

    /**
     * Crea un token de sesión de usuario para WOPI. Se usa como access_token en la URL
     * para que CheckFileInfo/GetFile/PutFile sepan qué usuario es sin cambiar el docId.
     */
    createUserSessionToken(
        userId: number,
        projectId: string,
        itemId: string,
        fileName: string,
        expiresInMinutes: number,
        accessToken?: string,
    ): string {
        const token = randomUUID();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000);
        this.userSessions.set(token, {
            token,
            userId,
            projectId,
            itemId,
            fileName,
            accessToken,
            expiresAt,
        });
        return token;
    }

    /**
     * Valida el access_token de sesión y devuelve los datos si es válido.
     * Comprobar además que generateStableDocId(projectId, itemId) === docId del path.
     */
    validateUserSessionToken(accessToken: string): UserSessionTokenData | null {
        const session = this.userSessions.get(accessToken);
        if (!session || new Date() > session.expiresAt) {
            if (session) this.userSessions.delete(accessToken);
            return null;
        }
        return {
            userId: session.userId,
            projectId: session.projectId,
            itemId: session.itemId,
            fileName: session.fileName,
            accessToken: session.accessToken,
            expiresAt: session.expiresAt,
        };
    }

    /**
     * Limpia tokens expirados
     */
    private cleanExpiredTokens(): void {
        const now = new Date();
        for (const [token, data] of this.tokens.entries()) {
            if (now > data.expiresAt) {
                this.tokens.delete(token);
            }
        }
        for (const [token, data] of this.userSessions.entries()) {
            if (now > data.expiresAt) {
                this.userSessions.delete(token);
            }
        }
    }
}
