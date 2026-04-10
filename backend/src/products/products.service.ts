import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class ProductsService {
  // Inyectamos la conexión que creamos en el DatabaseModule
  constructor(@Inject('DATABASE_POOL') private db: any) {}

  // Obtener todos los productos (para tu web de React)
  async findAll() {
    const result = await this.db.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
  }

  // Insertar un nuevo nootrópico (para cuando quieras añadir stock)
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
}