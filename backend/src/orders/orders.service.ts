import { Injectable, Inject } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

export interface Order {
  id: string;
  customer_id: string;
  items: unknown;
  total_paid: number;
  status: string;
  created_at: string;
}

@Injectable()
export class OrdersService {
  constructor(@Inject('DATABASE_POOL') private db: any) {}

  async create(customerId: string, dto: CreateOrderDto): Promise<Order> {
    const result = await this.db.query(
      `INSERT INTO orders (customer_id, items, products_snapshot, total_paid, status, shipping_address)
       VALUES ($1, $2::jsonb, $2::jsonb, $3, 'Pendiente', $4::jsonb)
       RETURNING *`,
      [customerId, JSON.stringify(dto.items), dto.total, JSON.stringify(dto.shippingAddress)],
    );
    return result.rows[0];
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    const result = await this.db.query(
      `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
      [customerId],
    );
    return result.rows;
  }
}
