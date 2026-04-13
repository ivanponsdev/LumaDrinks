import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';

// Verifica que el usuario autenticado tenga role='admin' en public.users
@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(@Inject('DATABASE_POOL') private db: any) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    if (!userId) throw new ForbiddenException('Not authenticated');

    const result = await this.db.query(
      `SELECT role FROM public.users WHERE id = $1`,
      [userId],
    );
    if (result.rows[0]?.role !== 'admin')
      throw new ForbiddenException('Admin access required');
    return true;
  }
}
