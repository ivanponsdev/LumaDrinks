import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.create(req.user.id, dto);
  }

  @Get('my')
  findMine(@Request() req: any) {
    return this.ordersService.findByCustomer(req.user.id);
  }
}
