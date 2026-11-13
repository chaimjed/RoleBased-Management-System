import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'le-token-reçu-par-email' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'nouveauPassword123', minLength: 8 })
  @MinLength(8)
  newPassword!: string;

  @ApiProperty({ example: 'nouveauPassword123', minLength: 8 })
  @MinLength(8)
  confirmNewPassword!: string;
}