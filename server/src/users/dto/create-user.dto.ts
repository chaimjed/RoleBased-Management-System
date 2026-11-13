import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength, IsDateString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Chaima' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Ben Salah' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: 'chaima@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+21612345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '2000-01-01' })
  @IsDateString()
  dateOfBirth!: string;

  @ApiProperty({ example: 'TempPass123!' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'roleid' })
  @IsString()
  roleId!: string;
}