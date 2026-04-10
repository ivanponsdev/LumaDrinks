import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Esto lee el .env
    DatabaseModule, ProductsModule, // Esto conecta a Supabase
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}