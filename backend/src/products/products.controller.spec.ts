import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AdminRoleGuard } from '../admin/admin-role.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const mockProductsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminRoleGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getAll() delegates to productsService.findAll()', async () => {
    mockProductsService.findAll.mockResolvedValue([]);
    await controller.getAll();
    expect(mockProductsService.findAll).toHaveBeenCalledTimes(1);
  });

  it('getOne() delegates to productsService.findOne() with correct id', async () => {
    mockProductsService.findOne.mockResolvedValue({ id: 'p1' });
    await controller.getOne('p1');
    expect(mockProductsService.findOne).toHaveBeenCalledWith('p1');
  });
});

