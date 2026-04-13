import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';

// uuid usa ESM; lo mockeamos para evitar errores de transformación en Jest
jest.mock('uuid', () => ({ v4: () => 'mock-payment-uuid' }));

const mockDb = {
  query: jest.fn(),
};

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: 'DATABASE_POOL', useValue: mockDb },
      ],
    }).compile();
    service = module.get<PaymentsService>(PaymentsService);
  });

  describe('simulate()', () => {
    const validDto = {
      orderId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      amount: 29.99,
      cardholderName: 'Test User',
      cardNumber: '4242424242424242',
      expiry: '12/34',
      cvc: '123',
    };

    beforeEach(() => {
      mockDb.query.mockResolvedValue({ rows: [{ id: 'new-uuid' }] });
    });

    it('returns paymentId and status succeeded', async () => {
      const result = await service.simulate(validDto, 'user-1');
      expect(result.status).toBe('succeeded');
      expect(result.paymentId).toBeDefined();
      expect(typeof result.paymentId).toBe('string');
    });

    it('stores only last4, never the full card number', async () => {
      await service.simulate(validDto, 'user-1');
      const [, params] = mockDb.query.mock.calls[0];
      const last4 = params[4];
      expect(last4).toBe('4242');
      // El número completo nunca debe aparecer en los parámetros de la query
      const paramsString = JSON.stringify(params);
      expect(paramsString).not.toContain('4242424242424242');
    });

    it('never stores the CVC in the DB', async () => {
      await service.simulate(validDto, 'user-1');
      const [, params] = mockDb.query.mock.calls[0];
      const metadata = JSON.parse(params[5] as string);
      expect(metadata).not.toHaveProperty('cvc');
      expect(JSON.stringify(metadata)).not.toContain('123');
    });

    it('never stores cardholder name in a top-level column', async () => {
      await service.simulate(validDto, 'user-1');
      const [, params] = mockDb.query.mock.calls[0];
      // cardholderName solo puede estar dentro del jsonb metadata, no como columna standalone
      // params[0]=id, [1]=order_id, [2]=amount, [3]=status, [4]=last4, [5]=metadata
      expect(params.slice(0, 5)).not.toContain('Test User');
    });

    it('inserts into public.payments table', async () => {
      await service.simulate(validDto, 'user-1');
      const [sql] = mockDb.query.mock.calls[0];
      expect(sql).toContain('public.payments');
      expect(sql).toContain('INSERT');
    });

    it('works with null orderId', async () => {
      const dto = { ...validDto, orderId: undefined };
      const result = await service.simulate(dto, 'user-1');
      expect(result.status).toBe('succeeded');
      const [, params] = mockDb.query.mock.calls[0];
      expect(params[1]).toBeNull();
    });
  });

  describe('findAll()', () => {
    it('returns rows from DB', async () => {
      const fakeRows = [{ id: 'p1', amount: 10 }, { id: 'p2', amount: 20 }];
      mockDb.query.mockResolvedValue({ rows: fakeRows });
      const result = await service.findAll();
      expect(result).toEqual(fakeRows);
    });

    it('uses default pagination (50 limit, 0 offset)', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      await service.findAll();
      const [, params] = mockDb.query.mock.calls[0];
      expect(params[0]).toBe(50);
      expect(params[1]).toBe(0);
    });

    it('respects custom limit and offset', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      await service.findAll(10, 20);
      const [, params] = mockDb.query.mock.calls[0];
      expect(params[0]).toBe(10);
      expect(params[1]).toBe(20);
    });
  });
});
