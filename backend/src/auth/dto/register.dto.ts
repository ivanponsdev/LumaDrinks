import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Formato de email inválido' })
  email: string;

  // Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 dígito
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string;
}
