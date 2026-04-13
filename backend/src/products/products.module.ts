import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AuthModule } from '../auth/auth.module';
import { AdminRoleGuard } from '../admin/admin-role.guard';

@Module({
  imports: [AuthModule],
  providers: [ProductsService, AdminRoleGuard],
  controllers: [ProductsController],
})
export class ProductsModule {}
