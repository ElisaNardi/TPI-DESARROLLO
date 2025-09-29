
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Este DTO (Data Transfer Object - Objeto de Transferencia de Datos) "formulario de aduanas" de la API.
 * define la estructura y las reglas de los datos que esperamos recibir en el endpoint de registro.
 * NestJS lo usará automáticamente para validar automáticamente los datos que llegan. 
 *  Si los datos no cumplen con las reglas del "formulario de aduanas", NestJS los rechaza automáticamente
 *  con un error 400 Bad Request, protegiendo tu lógica de negocio de recibir datos basura.
 */
export class RegisterUserDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail({}, { message: 'Por favor, ingrese un formato de email válido.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;
}