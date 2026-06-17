import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_CSRF_KEY } from '../decorators/skip-csrf.decorator';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const req = context.switchToHttp().getRequest();
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;

    // Cross-domain SPA requests from trusted origins are already CSRF-protected by
    // the CORS origin whitelist + credentials policy — double-submit cookie adds nothing.
    const origin = req.headers['origin'] as string | undefined;
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    if (
      origin &&
      (origin === frontendUrl ||
        origin === 'http://localhost:3000' ||
        origin.endsWith('.vercel.app'))
    ) {
      return true;
    }

    const headerToken = req.headers['x-csrf-token'] as string | undefined;
    const cookieToken = req.cookies?.csrfToken as string | undefined;

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      throw new ForbiddenException('Invalid CSRF token');
    }
    return true;
  }
}
