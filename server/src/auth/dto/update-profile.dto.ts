
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Chaima', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Eljed', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '2001-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: '+21612345678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}