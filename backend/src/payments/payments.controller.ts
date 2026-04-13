import {
  Controller, Post, Get, Body, Request,
  UseGuards, Query, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminRoleGuard } from '../admin/admin-role.guard';
import { PaymentsService } from './payments.service';
import { SimulatePaymentDto } from './dto/simulate-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Cualquier usuario autenticado puede iniciar un pago simulado */
  @UseGuards(JwtAuthGuard)
  @Post('simulate')
  simulate(@Body() dto: SimulatePaymentDto, @Request() req: any) {
    return this.paymentsService.simulate(dto, req.user.id);
  }

  /** Solo admins pueden listar todos los pagos */
  @UseGuards(JwtAuthGuard, AdminRoleGuard)
  @Get()
  findAll(
    @Query('limit',  new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0),  ParseIntPipe) offset: number,
  ) {
    return this.paymentsService.findAll(limit, offset);
  }
}
