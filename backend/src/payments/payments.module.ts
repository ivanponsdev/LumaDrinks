import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminRoleGuard } from '../admin/admin-role.guard';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [AuthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, AdminRoleGuard],
})
export class PaymentsModule {}
