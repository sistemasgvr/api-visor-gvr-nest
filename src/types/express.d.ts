import type { AuthenticatedUser } from '../shared/types/authenticated-user';

declare global {
  namespace Express {
    /**
     * Passport puebla `req.user` con el retorno de JwtStrategy.validate.
     * @see JwtStrategy
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthenticatedUser {}
  }
}

declare module 'express-serve-static-core' {
  /**
   * Asignado al inicio del pipeline HTTP (p. ej. en {@link useRequestId}).
   */
  interface Request {
    /**
     * Presente en runtime cuando aplica el middleware (p. ej. {@link useRequestId} en `main.ts`).
     */
    requestId?: string;
  }
}

export {};
