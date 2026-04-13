import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';

const mockDb = { query: jest.fn() };

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: 'DATABASE_POOL', useValue: mockDb },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll() queries products ordered by created_at DESC', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });
    await service.findAll();
    const [sql] = mockDb.query.mock.calls[0];
    expect(sql).toContain('ORDER BY created_at DESC');
  });

  it('findOne() queries by id', async () => {
    mockDb.query.mockResolvedValue({ rows: [{ id: 'p1' }] });
    const result = await service.findOne('p1');
    expect(result).toEqual({ id: 'p1' });
    expect(mockDb.query.mock.calls[0][1]).toEqual(['p1']);
  });

  it('findOne() returns null when product not found', async () => {
    mockDb.query.mockResolvedValue({ rows: [] });
    const result = await service.findOne('nonexistent');
    expect(result).toBeNull();
  });
});

