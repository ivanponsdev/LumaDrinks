import { Injectable, Inject } from '@nestjs/common';
import { SaveCartDto } from './dto/save-cart.dto';

@Injectable()
export class CartService {
  constructor(@Inject('DATABASE_POOL') private db: any) {}

  async getCart(userId: string): Promise<{ items: unknown[] }> {
    const result = await this.db.query(
      `SELECT items FROM cart WHERE user_id = $1`,
      [userId],
    );
    if (result.rows.length === 0) return { items: [] };
    return { items: result.rows[0].items };
  }

  async saveCart(userId: string, dto: SaveCartDto): Promise<{ items: unknown[] }> {
    const result = await this.db.query(
      `INSERT INTO cart (user_id, items)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (user_id)
       DO UPDATE SET items = EXCLUDED.items, updated_at = now()
       RETURNING items`,
      [userId, JSON.stringify(dto.items)],
    );
    return { items: result.rows[0].items };
  }
}
