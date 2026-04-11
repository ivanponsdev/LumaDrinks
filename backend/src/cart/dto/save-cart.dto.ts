import { IsArray, IsString, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class SaveCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
