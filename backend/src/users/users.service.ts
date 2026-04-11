import { Injectable, Inject } from '@nestjs/common';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

@Injectable()
export class UsersService {
  constructor(@Inject('DATABASE_POOL') private db: any) {}

  async findById(id: string): Promise<UserProfile | null> {
    const result = await this.db.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [id],
    );
    return result.rows[0] ?? null;
  }

  async findOrCreate(supabaseUser: { id: string; email: string }): Promise<UserProfile> {
    const existing = await this.findById(supabaseUser.id);
    if (existing) return existing;

    const result = await this.db.query(
      `INSERT INTO users (id, email) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
       RETURNING id, email, name, created_at`,
      [supabaseUser.id, supabaseUser.email],
    );
    return result.rows[0];
  }

  async updateProfile(id: string, data: { name?: string }): Promise<UserProfile> {
    const result = await this.db.query(
      `UPDATE users SET name = COALESCE($2, name)
       WHERE id = $1
       RETURNING id, email, name, created_at`,
      [id, data.name ?? null],
    );
    return result.rows[0];
  }
}
