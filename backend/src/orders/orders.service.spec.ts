import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';

const mockDb = {
  query: jest.fn(),
};

const validDto = {
  items: [
    { id: 'prod-1', name: 'Focus Drink', price: 29.99, quantity: 2 },
    { id: 'prod-2', name: 'Zen Shot', price: 19.99, quantity: 1 },
  ],
  total: 79.97,
  shippingAddress: {
    street: 'Calle Test 1',
    city: 'Madrid',
    postalCode: '28001',
    province: 'Madrid',
  },
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: 'DATABASE_POOL', useValue: mockDb },
      ],
    }).compile();
    service = module.get<OrdersService>(OrdersService);
  });

  describe('create()', () => {
    const fakeOrder = {
      id: 'order-uuid',
      customer_id: 'user-1',
      items: validDto.items,
      total_paid: validDto.total,
      status: 'Pendiente',
      created_at: new Date().toISOString(),
    };

    beforeEach(() => {
      mockDb.query.mockResolvedValue({ rows: [fakeOrder] });
    });

    it('returns the created order', async () => {
      const result = await service.create('user-1', validDto as any);
      expect(result).toEqual(fakeOrder);
    });

    it('inserts into orders table with correct customer_id', async () => {
      await service.create('user-1', validDto as any);
      const [sql, params] = mockDb.query.mock.calls[0];
      expect(sql).toContain('INSERT INTO orders');
      expect(params[0]).toBe('user-1');
    });

    it('uses RETURNING * to get the full created row', async () => {
      await service.create('user-1', validDto as any);
      const [sql] = mockDb.query.mock.calls[0];
      expect(sql).toContain('RETURNING *');
    });

    it('sets initial status to Pendiente', async () => {
      await service.create('user-1', validDto as any);
      const [sql] = mockDb.query.mock.calls[0];
      expect(sql).toContain("'Pendiente'");
    });
  });

  describe('findByCustomer()', () => {
    it('returns orders for the given customer', async () => {
      const fakeOrders = [
        { id: 'o1', customer_id: 'user-1', total_paid: 30 },
        { id: 'o2', customer_id: 'user-1', total_paid: 60 },
      ];
      mockDb.query.mockResolvedValue({ rows: fakeOrders });

      const result = await service.findByCustomer('user-1');
      expect(result).toEqual(fakeOrders);
    });

    it('queries only by the given customer_id', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      await service.findByCustomer('user-abc');
      const [sql, params] = mockDb.query.mock.calls[0];
      expect(sql).toContain('WHERE customer_id = $1');
      expect(params[0]).toBe('user-abc');
    });

    it('returns empty array if customer has no orders', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      const result = await service.findByCustomer('user-new');
      expect(result).toEqual([]);
    });

    it('orders results by created_at DESC', async () => {
      mockDb.query.mockResolvedValue({ rows: [] });
      await service.findByCustomer('user-1');
      const [sql] = mockDb.query.mock.calls[0];
      expect(sql).toContain('ORDER BY created_at DESC');
    });
  });
});
