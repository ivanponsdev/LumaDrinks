import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SaveCartDto } from './dto/save-cart.dto';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Put()
  saveCart(@Body() dto: SaveCartDto, @Request() req: any) {
    return this.cartService.saveCart(req.user.id, dto);
  }
}
