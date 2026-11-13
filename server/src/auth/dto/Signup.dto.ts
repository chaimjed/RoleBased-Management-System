import { IsEmail, IsString, MinLength, IsDateString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'test' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'test' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: '2001-01-01' })
  @IsDateString()
  dateOfBirth!: string;

  @ApiProperty({ example: 'test@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+21612345678' })
  @Matches(/^\+?[0-9]{8,15}$/, { message: 'Numéro de téléphone invalide' })
  phone!: string;

  @ApiProperty({ example: 'Password123@', minLength: 8 })
  @MinLength(8)
    @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'password must contain at least one uppercase letter,one lowercase letter,one number and one special character ',
    },)
  password!: string;

  @ApiProperty({ example: 'Password123@', minLength: 8 })
  @MinLength(8)
  confirmPassword!: string;
}