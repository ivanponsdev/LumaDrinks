import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() price?: number;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsArray() ingredients?: string[];
  @IsOptional() @IsArray() benefits?: string[];
  @IsOptional() @IsNumber() stock?: number;
  @IsOptional() @IsString() image_url?: string;
}
