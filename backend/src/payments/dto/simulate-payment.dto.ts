import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID, Matches, Length } from 'class-validator';

export class SimulatePaymentDto {
  @IsUUID() @IsOptional()
  orderId?: string;

  @IsNumber()
  amount: number;

  @IsString() @IsNotEmpty()
  cardholderName: string;

  /** 16 dígitos, sin espacios */
  @IsString()
  @Matches(/^\d{16}$/, { message: 'El número de tarjeta debe tener 16 dígitos' })
  cardNumber: string;

  /** Formato MM/YY */
  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: 'La fecha debe tener formato MM/YY' })
  expiry: string;

  /** 3 o 4 dígitos */
  @IsString()
  @Length(3, 4, { message: 'El CVC debe tener 3 o 4 dígitos' })
  @Matches(/^\d{3,4}$/, { message: 'El CVC solo puede contener dígitos' })
  cvc: string;
}
