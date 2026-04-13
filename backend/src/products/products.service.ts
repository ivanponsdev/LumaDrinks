import { Injectable, Inject } from '@nestjs/common';
import { UpdateProductDto } from './dto/update-product.dto';

// Whitelist de columnas actualizables para evitar inyección de nombres de campo
const UPDATABLE_FIELDS = [
  'name', 'description', 'price', 'category',
  'ingredients', 'benefits', 'stock', 'image_url',
];

@Injectable()
export class ProductsService {
  constructor(@Inject('DATABASE_POOL') private db: any) {}

  async findAll() {
    const result = await this.db.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
  }

  async findOne(id: string) {
    const result = await this.db.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  }

  async create(p: any) {
    const query = `
      INSERT INTO products (name, description, price, category, ingredients, benefits, stock, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [p.name, p.description, p.price, p.category, p.ingredients, p.benefits, p.stock, p.image_url];
    const res = await this.db.query(query, values);
    return res.rows[0];
  }

  async update(id: string, dto: UpdateProductDto) {
    const fields = Object.keys(dto).filter(
      (k) => UPDATABLE_FIELDS.includes(k) && (dto as any)[k] !== undefined,
    );
    if (!fields.length) return this.findOne(id);
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = [id, ...fields.map((f) => (dto as any)[f])];
    const res = await this.db.query(
      `UPDATE products SET ${setClause} WHERE id = $1 RETURNING *`,
      values,
    );
    return res.rows[0] ?? null;
  }

  async remove(id: string) {
    await this.db.query('DELETE FROM products WHERE id = $1', [id]);
    return { deleted: true };
  }
}