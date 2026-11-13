import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsString, MinLength, ValidateIf } from 'class-validator';
import { user_status } from '@prisma/client';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: user_status, example: 'SUSPENDED' })
  @IsEnum(user_status)
  status!: user_status;

  @ApiPropertyOptional({ example: 'Repeated policy violations' })
  @ValidateIf((o) => o.status === 'SUSPENDED' || o.status === 'BANNED')
  @IsString()
  @MinLength(3, { message: 'Reason is required' })
  reason?: string;

  @ApiPropertyOptional({ example: 7, enum: [7, 15, 30] })
  @ValidateIf((o) => o.status === 'SUSPENDED')
  @IsIn([7, 15, 30], { message: 'Delay must be 7, 15, or 30 days' })
  delayDays?: number;
}