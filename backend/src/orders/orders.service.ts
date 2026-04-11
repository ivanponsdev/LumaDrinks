import { Injectable, Inject } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';

export interface Order {
  id: string;
  customer_id: string;
  items: unknown;
  total: number;
  status: string;
  created_at: string;
}

@Injectable()
export class OrdersService {
  constructor(@Inject('DATABASE_POOL') private db: any) {}

  async create(customerId: string, dto: CreateOrderDto): Promise<Order> {
    const result = await this.db.query(
      `INSERT INTO orders (customer_id, items, total, status)
       VALUES ($1, $2::jsonb, $3, 'pending')
       RETURNING *`,
      [customerId, JSON.stringify(dto.items), dto.total],
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
