import { Injectable } from '@nestjs/common';

interface WopiLockEntry {
    lock: string;
    expiresAt: number;
}

@Injectable()
export class WopiLockService {
    private readonly locks = new Map<string, WopiLockEntry>();
    private readonly DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutos

    getLock(fileId: string): string | null {
        const entry = this.locks.get(fileId);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.locks.delete(fileId);
            return null;
        }
        return entry.lock;
    }

    setLock(fileId: string, lock: string, ttlMs?: number): { ok: boolean; currentLock?: string } {
        const existing = this.getLock(fileId);
        if (existing && existing !== lock) {
            return { ok: false, currentLock: existing };
        }
        this.locks.set(fileId, {
            lock,
            expiresAt: Date.now() + (ttlMs ?? this.DEFAULT_TTL_MS),
        });
        return { ok: true };
    }

    refreshLock(fileId: string, lock: string, ttlMs?: number): { ok: boolean; currentLock?: string } {
        const existing = this.getLock(fileId);
        if (!existing || existing !== lock) {
            return { ok: false, currentLock: existing ?? undefined };
        }
        this.locks.set(fileId, {
            lock,
            expiresAt: Date.now() + (ttlMs ?? this.DEFAULT_TTL_MS),
        });
        return { ok: true };
    }

    unlock(fileId: string, lock: string): { ok: boolean; currentLock?: string } {
        const existing = this.getLock(fileId);
        if (!existing || existing !== lock) {
            return { ok: false, currentLock: existing ?? undefined };
        }
        this.locks.delete(fileId);
        return { ok: true };
    }
}
