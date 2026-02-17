import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

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
     * Limpia tokens expirados
     */
    private cleanExpiredTokens(): void {
        const now = new Date();
        for (const [token, data] of this.tokens.entries()) {
            if (now > data.expiresAt) {
                this.tokens.delete(token);
            }
        }
    }
}
