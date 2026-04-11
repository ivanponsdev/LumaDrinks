import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(private config: ConfigService) {
    // Usamos la anon key: Supabase permite signUp/signIn con ella
    this.supabase = createClient(
      config.getOrThrow<string>('SUPABASE_URL'),
      config.getOrThrow<string>('SUPABASE_ANON_KEY'),
    );
  }

  async register(email: string, password: string) {
    const { error } = await this.supabase.auth.signUp({ email, password });
    if (error) throw new BadRequestException(error.message);
    return { message: 'Revisa tu email para confirmar la cuenta' };
  }

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw new UnauthorizedException(error.message);
    // Devolvemos la sesión para que el frontend la active con supabase.auth.setSession()
    return { session: data.session };
  }
}
