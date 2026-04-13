import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminRoleGuard } from '../admin/admin-role.guard';
import { ProductsService } from './products.service';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /** Público — catálogo completo */
  @Get()
  getAll() {
    return this.productsService.findAll();
  }

  /** Público — detalle de un producto */
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /** Admin — crear producto */
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Post()
  create(@Body() body: any) {
    return this.productsService.create(body);
  }

  /** Admin — actualizar producto */
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  /** Admin — eliminar producto */
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}