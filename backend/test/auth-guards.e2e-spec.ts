/**
 * E2E — Auth Guards
 *
 * Verifica que las rutas protegidas devuelvan 401 sin token
 * y que las rutas públicas devuelvan 200/201 sin token.
 *
 * Usa un AppModule con DATABASE_POOL mockeado para no necesitar
 * una base de datos real.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

// ─── Mock del pool de base de datos ───────────────────────────────────────────
// Reemplaza el pool real para que los tests no necesiten Postgres
const mockPool = {
  query: jest.fn().mockResolvedValue({ rows: [] }),
};

jest.mock('../src/database/database.module', () => ({
  DatabaseModule: {
    module: class DatabaseModuleMock {},
    providers: [{ provide: 'DATABASE_POOL', useValue: mockPool }],
    exports: ['DATABASE_POOL'],
  },
}));

describe('Auth Guards (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Rutas protegidas — deben exigir JWT ───────────────────────────────────
  it('GET /auth/me → 401 sin token', () =>
    request(app.getHttpServer()).get('/auth/me').expect(401));

  it('PATCH /auth/profile → 401 sin token', () =>
    request(app.getHttpServer()).patch('/auth/profile').expect(401));

  it('POST /orders → 401 sin token', () =>
    request(app.getHttpServer()).post('/orders').expect(401));

  it('GET /orders/my → 401 sin token', () =>
    request(app.getHttpServer()).get('/orders/my').expect(401));

  it('GET /cart → 401 sin token', () =>
    request(app.getHttpServer()).get('/cart').expect(401));

  it('PUT /cart → 401 sin token', () =>
    request(app.getHttpServer()).put('/cart').expect(401));

  it('POST /payments/simulate → 401 sin token', () =>
    request(app.getHttpServer()).post('/payments/simulate').expect(401));

  it('GET /payments → 401 sin token (admin)', () =>
    request(app.getHttpServer()).get('/payments').expect(401));

  // ── DTO validation — rechazan datos inválidos ──────────────────────────────
  it('POST /auth/register → 400 con body vacío', () =>
    request(app.getHttpServer()).post('/auth/register').send({}).expect(400));

  it('POST /auth/login → 400 con body vacío', () =>
    request(app.getHttpServer()).post('/auth/login').send({}).expect(400));
});
