import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminRoleGuard } from './admin-role.guard';

const mockDb = {
  query: jest.fn(),
};

function buildContext(userId: string | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: userId ? { id: userId } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('AdminRoleGuard', () => {
  let guard: AdminRoleGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new AdminRoleGuard(mockDb);
  });

  it('allows access when user has role=admin', async () => {
    mockDb.query.mockResolvedValue({ rows: [{ role: 'admin' }] });
    const result = await guard.canActivate(buildContext('admin-user-id'));
    expect(result).toBe(true);
  });

  it('throws ForbiddenException when role is not admin', async () => {
    mockDb.query.mockResolvedValue({ rows: [{ role: 'customer' }] });
    await expect(guard.canActivate(buildContext('customer-id'))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException when user row not found', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });
    await expect(guard.canActivate(buildContext('unknown-id'))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('throws ForbiddenException when no userId in request', async () => {
    await expect(guard.canActivate(buildContext(undefined))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('queries public.users with the correct userId', async () => {
    mockDb.query.mockResolvedValue({ rows: [{ role: 'admin' }] });
    await guard.canActivate(buildContext('target-user-id'));
    const [sql, params] = mockDb.query.mock.calls[0];
    expect(sql).toContain('public.users');
    expect(params[0]).toBe('target-user-id');
  });
});
