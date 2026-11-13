import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'password123' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ example: 'nouveauPassword456', minLength: 8 })
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({ example: 'nouveauPassword456', minLength: 8 })
  @MinLength(8)
  confirmNewPassword!: string;
}